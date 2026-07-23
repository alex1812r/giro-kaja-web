import { ApiError } from "@/lib/api/apiError";
import { requireSuperadminFromSession } from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";

import type {
  AdminOrganizationDetail,
  AdminOrganizationListItem,
  AdminOrganizationMember,
} from "../types";
import { purgeOrganizationById } from "./purgeOrganization.server";

type OrgRow = {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
};

type MemberRow = {
  user_id: string;
  role: string;
  created_at: string;
  organization_id: string;
};

export async function listAdminOrganizations(): Promise<
  AdminOrganizationListItem[]
> {
  await requireSuperadminFromSession();
  const service = createServiceRoleClient();

  const { data: orgs, error } = await service
    .from("organizations")
    .select("id, name, created_at, created_by")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const rows = (orgs ?? []) as OrgRow[];
  if (rows.length === 0) {
    return [];
  }

  const { data: members, error: membersError } = await service
    .from("organization_members")
    .select("organization_id")
    .in(
      "organization_id",
      rows.map((o) => o.id),
    );

  if (membersError) {
    throw new ApiError(500, "INTERNAL_ERROR", membersError.message);
  }

  const counts = new Map<string, number>();
  for (const m of members ?? []) {
    const id = (m as { organization_id: string }).organization_id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return rows.map((org) => ({
    id: org.id,
    name: org.name,
    createdAt: org.created_at,
    createdBy: org.created_by,
    memberCount: counts.get(org.id) ?? 0,
  }));
}

export async function getAdminOrganizationDetail(
  organizationId: string,
): Promise<AdminOrganizationDetail> {
  await requireSuperadminFromSession();
  const service = createServiceRoleClient();

  const { data: org, error } = await service
    .from("organizations")
    .select("id, name, created_at, created_by")
    .eq("id", organizationId)
    .maybeSingle<OrgRow>();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }
  if (!org) {
    throw new ApiError(404, "NOT_FOUND", "Organización no encontrada.");
  }

  const { data: members, error: membersError } = await service
    .from("organization_members")
    .select("user_id, role, created_at, organization_id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw new ApiError(500, "INTERNAL_ERROR", membersError.message);
  }

  const memberRows = (members ?? []) as MemberRow[];
  const userIds = memberRows.map((m) => m.user_id);

  const { data: profiles } = await service
    .from("profiles")
    .select("user_id, display_name")
    .in(
      "user_id",
      userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"],
    );

  const profileMap = new Map(
    ((profiles ?? []) as { user_id: string; display_name: string | null }[]).map(
      (p) => [p.user_id, p.display_name],
    ),
  );

  const emailMap = new Map<string, string | null>();
  for (const userId of userIds) {
    const { data } = await service.auth.admin.getUserById(userId);
    emailMap.set(userId, data.user?.email ?? null);
  }

  const detailMembers: AdminOrganizationMember[] = memberRows.map((m) => ({
    userId: m.user_id,
    email: emailMap.get(m.user_id) ?? null,
    name: profileMap.get(m.user_id)?.trim() || emailMap.get(m.user_id) || m.user_id.slice(0, 8),
    role: m.role,
    createdAt: m.created_at,
  }));

  const [{ count: loanCount }, { count: debtCount }] = await Promise.all([
    service
      .from("loans")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    service
      .from("debts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
  ]);

  return {
    id: org.id,
    name: org.name,
    createdAt: org.created_at,
    createdBy: org.created_by,
    memberCount: detailMembers.length,
    loanCount: loanCount ?? 0,
    debtCount: debtCount ?? 0,
    members: detailMembers,
  };
}

export type DeleteAdminOrganizationResult = {
  deletedOrganizationId: string;
};

/** Critical: deletes organization and all tenant data (loans, debts, vault, etc.). */
export async function deleteAdminOrganization(
  organizationId: string,
): Promise<DeleteAdminOrganizationResult> {
  await requireSuperadminFromSession();
  const service = createServiceRoleClient();

  const { data: org, error } = await service
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }
  if (!org) {
    throw new ApiError(404, "NOT_FOUND", "Organización no encontrada.");
  }

  await purgeOrganizationById(service, organizationId);

  return { deletedOrganizationId: organizationId };
}
