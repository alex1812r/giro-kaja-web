import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import {
  isOrganizationRole,
  type AuthMembership,
  type AuthOrganization,
  type OrganizationRole,
} from "@/modules/auth/types";

export type OrganizationMembershipContext = {
  organization: AuthOrganization | null;
  role: OrganizationRole;
};

type ProfileOrgRow = {
  default_organization_id: string | null;
};

type OrganizationRow = {
  id: string;
  name: string;
};

type MemberRow = {
  role: string;
  organization_id: string;
  organizations:
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
};

function asOrg(
  value: MemberRow["organizations"],
): AuthOrganization | null {
  const org = Array.isArray(value) ? value[0] : value;
  if (!org?.id) {
    return null;
  }
  return { id: org.id, name: org.name?.trim() || "—" };
}

/**
 * Resolves active organization + role for a user.
 * Falls back to owner / null org when Fase 1 tables are missing or empty (legacy).
 */
export async function getOrganizationMembershipForUser(
  userId: string,
): Promise<OrganizationMembershipContext> {
  const fallback: OrganizationMembershipContext = {
    organization: null,
    role: "owner",
  };

  try {
    const supabase = await createRouteSupabaseClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("default_organization_id")
      .eq("user_id", userId)
      .maybeSingle<ProfileOrgRow>();

    if (profileError) {
      return fallback;
    }

    const defaultOrgId = profile?.default_organization_id ?? null;

    if (defaultOrgId) {
      const { data: member, error: memberError } = await supabase
        .from("organization_members")
        .select("role, organization_id, organizations(id, name)")
        .eq("user_id", userId)
        .eq("organization_id", defaultOrgId)
        .maybeSingle<MemberRow>();

      if (!memberError && member && isOrganizationRole(member.role)) {
        const organization =
          asOrg(member.organizations) ??
          (await fetchOrganizationById(defaultOrgId)) ??
          { id: defaultOrgId, name: "—" };
        return {
          organization,
          role: member.role,
        };
      }
    }

    const { data: firstMember, error: firstError } = await supabase
      .from("organization_members")
      .select("role, organization_id, organizations(id, name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<MemberRow>();

    if (firstError || !firstMember || !isOrganizationRole(firstMember.role)) {
      return fallback;
    }

    const organization =
      asOrg(firstMember.organizations) ??
      (await fetchOrganizationById(firstMember.organization_id)) ??
      { id: firstMember.organization_id, name: "—" };

    return {
      organization,
      role: firstMember.role,
    };
  } catch {
    return fallback;
  }
}

async function fetchOrganizationById(
  organizationId: string,
): Promise<AuthOrganization | null> {
  try {
    const supabase = await createRouteSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("id", organizationId)
      .maybeSingle<OrganizationRow>();

    if (error || !data) {
      return null;
    }

    return { id: data.id, name: data.name?.trim() || "—" };
  } catch {
    return null;
  }
}

/** All organizations the user belongs to (ordered by join date). */
export async function listOrganizationMembershipsForUser(
  userId: string,
): Promise<AuthMembership[]> {
  try {
    const supabase = await createRouteSupabaseClient();
    const { data, error } = await supabase
      .from("organization_members")
      .select("role, organization_id, organizations(id, name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error || !data) {
      return [];
    }

    const memberships: AuthMembership[] = [];
    for (const row of data as MemberRow[]) {
      if (!isOrganizationRole(row.role)) {
        continue;
      }
      const organization =
        asOrg(row.organizations) ??
        (await fetchOrganizationById(row.organization_id)) ??
        { id: row.organization_id, name: "—" };
      memberships.push({ organization, role: row.role });
    }
    return memberships;
  } catch {
    return [];
  }
}

/**
 * Persists active org on profiles.default_organization_id.
 * Caller must ensure the user is a member of organizationId.
 */
export async function setDefaultOrganizationIdForUser(
  userId: string,
  organizationId: string,
): Promise<void> {
  const supabase = await createRouteSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      default_organization_id: organizationId,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Best-effort profile row after login.
 * Never calls ensure_profile_for_user (older DB versions auto-create a Personal org).
 * Operators without a tenant complete `/onboarding/organization`.
 */
export async function ensureUserOrgBootstrap(userId: string): Promise<void> {
  try {
    const supabase = await createRouteSupabaseClient();
    await supabase.from("profiles").upsert(
      { user_id: userId },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  } catch {
    // profiles insert may be blocked by RLS before migrations; login still works.
  }
}
