import { ApiError } from "@/lib/api/apiError";
import { getAuthProfileFromSession } from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";
import {
  isOperatorRole,
  isOrganizationRole,
  isSuperadmin,
} from "@/modules/auth/types";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

import type { MyOrganizationDetail, MyOrganizationMember } from "../types";

type OrgRow = {
  id: string;
  name: string;
  created_at: string;
};

type MemberRow = {
  user_id: string;
  role: string;
  created_at: string;
  share_all_loans: boolean | null;
};

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function getMyOrganizationDetail(
  organizationId: string,
  currencyParam: string | null,
): Promise<MyOrganizationDetail> {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (isSuperadmin(profile)) {
    throw new ApiError(403, "FORBIDDEN", "No disponible para superadmin.");
  }

  const currency: CurrencyCode = isCurrencyCode(currencyParam ?? "")
    ? (currencyParam as CurrencyCode)
    : "USD";

  const service = createServiceRoleClient();

  const { data: membership, error: memberError } = await service
    .from("organization_members")
    .select("role")
    .eq("user_id", profile.id)
    .eq("organization_id", organizationId)
    .maybeSingle<{ role: string }>();

  if (memberError) {
    throw new ApiError(500, "INTERNAL_ERROR", memberError.message);
  }
  if (!membership || !isOrganizationRole(membership.role)) {
    throw new ApiError(404, "NOT_FOUND", "Organización no encontrada.");
  }

  const { data: org, error: orgError } = await service
    .from("organizations")
    .select("id, name, created_at")
    .eq("id", organizationId)
    .maybeSingle<OrgRow>();

  if (orgError) {
    throw new ApiError(500, "INTERNAL_ERROR", orgError.message);
  }
  if (!org) {
    throw new ApiError(404, "NOT_FOUND", "Organización no encontrada.");
  }

  const { data: members, error: membersError } = await service
    .from("organization_members")
    .select("user_id, role, created_at, share_all_loans")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw new ApiError(500, "INTERNAL_ERROR", membersError.message);
  }

  const memberRows = (members ?? []) as MemberRow[];
  const userIds = memberRows.map((m) => m.user_id);

  const { data: orgLoanIdRows } = await service
    .from("loans")
    .select("id")
    .eq("organization_id", organizationId);

  const orgLoanIds = ((orgLoanIdRows ?? []) as { id: string }[]).map((r) => r.id);

  const [{ data: profiles }, { data: shareRows }, { data: loans }, { data: debts }] =
    await Promise.all([
      service
        .from("profiles")
        .select("user_id, display_name")
        .in(
          "user_id",
          userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"],
        ),
      orgLoanIds.length > 0
        ? service
            .from("loan_shares")
            .select("user_id, loan_id")
            .in("loan_id", orgLoanIds)
            .in(
              "user_id",
              userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"],
            )
        : Promise.resolve({ data: [] as { user_id: string; loan_id: string }[] }),
      service
        .from("loans")
        .select("current_principal, status")
        .eq("organization_id", organizationId)
        .eq("currency", currency),
      service
        .from("debts")
        .select("current_principal, status")
        .eq("organization_id", organizationId)
        .eq("currency", currency),
    ]);

  const profileMap = new Map(
    (
      (profiles ?? []) as { user_id: string; display_name: string | null }[]
    ).map((p) => [p.user_id, p.display_name]),
  );

  const shareCountMap = new Map<string, number>();
  const shareIdsMap = new Map<string, string[]>();
  for (const row of (shareRows ?? []) as { user_id: string; loan_id: string }[]) {
    shareCountMap.set(row.user_id, (shareCountMap.get(row.user_id) ?? 0) + 1);
    const list = shareIdsMap.get(row.user_id) ?? [];
    list.push(row.loan_id);
    shareIdsMap.set(row.user_id, list);
  }

  const emailMap = new Map<string, string | null>();
  for (const userId of userIds) {
    const { data } = await service.auth.admin.getUserById(userId);
    emailMap.set(userId, data.user?.email ?? null);
  }

  const detailMembers: MyOrganizationMember[] = memberRows.flatMap((m) => {
    if (!isOrganizationRole(m.role)) {
      return [];
    }
    const email = emailMap.get(m.user_id) ?? null;
    return [
      {
        userId: m.user_id,
        email,
        name:
          profileMap.get(m.user_id)?.trim() ||
          email ||
          m.user_id.slice(0, 8),
        role: m.role,
        shareAllLoans: Boolean(m.share_all_loans),
        sharedLoanCount: shareCountMap.get(m.user_id) ?? 0,
        sharedLoanIds: shareIdsMap.get(m.user_id) ?? [],
      },
    ];
  });

  const totalLent = ((loans ?? []) as { current_principal: number | string; status: string }[])
    .filter((row) => row.status === "active" || row.status === "overdue")
    .reduce((sum, row) => sum + asNumber(row.current_principal), 0);

  const totalOwed = ((debts ?? []) as { current_principal: number | string; status: string }[])
    .filter((row) => row.status === "active" || row.status === "overdue")
    .reduce((sum, row) => sum + asNumber(row.current_principal), 0);

  return {
    id: org.id,
    name: org.name?.trim() || "—",
    role: membership.role,
    isActive: profile.organization?.id === org.id,
    canDelete: membership.role === "owner",
    canManageMembers: isOperatorRole(membership.role),
    createdAt: org.created_at,
    memberCount: detailMembers.length,
    members: detailMembers,
    totalLent,
    totalOwed,
    currency,
  };
}
