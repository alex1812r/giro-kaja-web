import { ApiError } from "@/lib/api/apiError";
import { getAuthProfileFromSession } from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";
import { isOrganizationRole, isSuperadmin } from "@/modules/auth/types";

import type { MyOrganizationItem } from "../types";

type MemberJoinRow = {
  role: string;
  created_at: string;
  organization_id: string;
  organizations:
    | { id: string; name: string; created_at: string }
    | { id: string; name: string; created_at: string }[]
    | null;
};

function asOrg(value: MemberJoinRow["organizations"]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function listMyOrganizations(): Promise<MyOrganizationItem[]> {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (isSuperadmin(profile)) {
    throw new ApiError(403, "FORBIDDEN", "No disponible para superadmin.");
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("organization_members")
    .select(
      "role, created_at, organization_id, organizations(id, name, created_at)",
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const rows = (data ?? []) as MemberJoinRow[];
  if (rows.length === 0) {
    return [];
  }

  const orgIds = rows.map((r) => r.organization_id);
  const { data: memberCounts, error: countError } = await service
    .from("organization_members")
    .select("organization_id")
    .in("organization_id", orgIds);

  if (countError) {
    throw new ApiError(500, "INTERNAL_ERROR", countError.message);
  }

  const counts = new Map<string, number>();
  for (const row of memberCounts ?? []) {
    const id = (row as { organization_id: string }).organization_id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const activeId = profile.organization?.id ?? null;

  return rows.flatMap((row) => {
    if (!isOrganizationRole(row.role)) {
      return [];
    }
    const org = asOrg(row.organizations);
    if (!org?.id) {
      return [];
    }
    return [
      {
        id: org.id,
        name: org.name?.trim() || "—",
        role: row.role,
        isActive: org.id === activeId,
        memberCount: counts.get(org.id) ?? 1,
        createdAt: org.created_at ?? row.created_at,
        canDelete: row.role === "owner",
      },
    ];
  });
}
