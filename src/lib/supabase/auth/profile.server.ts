import { ApiError } from "@/lib/api/apiError";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import type { AuthMembership, AuthUser, SystemRole } from "@/modules/auth/types";
import {
  isOperatorRole,
  isSuperadmin,
  isSystemRole,
} from "@/modules/auth/types";

import {
  ensureUserOrgBootstrap,
  getOrganizationMembershipForUser,
  listOrganizationMembershipsForUser,
} from "./organization.server";

export type ServerAuthProfile = AuthUser;

type ProfileRow = {
  display_name: string | null;
  phone: string | null;
  user_id: string;
  system_role?: string | null;
  is_active?: boolean | null;
};

function parseSystemRole(value: string | null | undefined): SystemRole | null {
  return isSystemRole(value) ? value : null;
}

function buildAuthUser(
  base: {
    id: string;
    email?: string;
    name: string;
    phone?: string | null;
    systemRole: SystemRole | null;
    isActive: boolean;
  },
  membership: Awaited<ReturnType<typeof getOrganizationMembershipForUser>>,
  memberships: AuthMembership[],
): AuthUser {
  if (base.systemRole === "superadmin") {
    return {
      ...base,
      role: "owner",
      organization: null,
      memberships: [],
    };
  }

  return {
    ...base,
    role: membership.role,
    organization: membership.organization,
    memberships,
  };
}

export async function getProfileByUserId(
  userId: string,
  email?: string | null,
): Promise<ServerAuthProfile | null> {
  const supabase = await createRouteSupabaseClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, phone, system_role, is_active")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  throwIfSupabaseError(error);

  if (!profile) {
    return null;
  }

  const systemRole = parseSystemRole(profile.system_role);
  const isActive = profile.is_active !== false;

  if (!isActive) {
    throw new ApiError(403, "FORBIDDEN", "Tu cuenta está desactivada.");
  }

  if (systemRole === "superadmin") {
    return buildAuthUser(
      {
        id: profile.user_id,
        email: email ?? undefined,
        name: profile.display_name?.trim() || email || "Usuario",
        phone: profile.phone,
        systemRole,
        isActive,
      },
      { organization: null, role: "owner" },
      [],
    );
  }

  const [membership, memberships] = await Promise.all([
    getOrganizationMembershipForUser(userId),
    listOrganizationMembershipsForUser(userId),
  ]);

  return buildAuthUser(
    {
      id: profile.user_id,
      email: email ?? undefined,
      name: profile.display_name?.trim() || email || "Usuario",
      phone: profile.phone,
      systemRole,
      isActive,
    },
    membership,
    memberships,
  );
}

export async function getAuthProfileFromSession(): Promise<ServerAuthProfile | null> {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    const message = userError.message?.toLowerCase() ?? "";
    if (message.includes("auth session missing")) {
      return null;
    }
    throwIfSupabaseError(userError);
  }

  if (!user) {
    return null;
  }

  try {
    const profile = await getProfileByUserId(user.id, user.email);
    if (profile) {
      return profile;
    }
  } catch (error) {
    if (error instanceof ApiError && error.code === "FORBIDDEN") {
      throw error;
    }
    throw error;
  }

  const [membership, memberships] = await Promise.all([
    getOrganizationMembershipForUser(user.id),
    listOrganizationMembershipsForUser(user.id),
  ]);

  return buildAuthUser(
    {
      id: user.id,
      email: user.email ?? undefined,
      name: user.email ?? "Usuario",
      phone: null,
      systemRole: null,
      isActive: true,
    },
    membership,
    memberships,
  );
}

/** Login path: ensure org bootstrap (skip for existing superadmin) then return profile. */
export async function getAuthProfileAfterLogin(
  userId: string,
  email?: string | null,
): Promise<ServerAuthProfile> {
  const supabase = await createRouteSupabaseClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("system_role, is_active")
    .eq("user_id", userId)
    .maybeSingle<{ system_role: string | null; is_active: boolean | null }>();

  if (existing?.is_active === false) {
    throw new ApiError(403, "FORBIDDEN", "Tu cuenta está desactivada.");
  }

  const alreadySuperadmin = isSystemRole(existing?.system_role);
  if (!alreadySuperadmin) {
    await ensureUserOrgBootstrap(userId);
  }

  const profile = await getProfileByUserId(userId, email);
  if (profile) {
    return profile;
  }

  const [membership, memberships] = await Promise.all([
    getOrganizationMembershipForUser(userId),
    listOrganizationMembershipsForUser(userId),
  ]);

  return buildAuthUser(
    {
      id: userId,
      email: email ?? undefined,
      name: email ?? "Usuario",
      phone: null,
      systemRole: null,
      isActive: true,
    },
    membership,
    memberships,
  );
}

export async function requireOperatorFromSession(): Promise<ServerAuthProfile> {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (isSuperadmin(profile)) {
    throw new ApiError(403, "FORBIDDEN", "No tienes permiso para esta acción.");
  }
  if (!isOperatorRole(profile.role)) {
    throw new ApiError(403, "FORBIDDEN", "No tienes permiso para esta acción.");
  }
  return profile;
}

export async function requireSuperadminFromSession(): Promise<ServerAuthProfile> {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (!isSuperadmin(profile)) {
    throw new ApiError(403, "FORBIDDEN", "Solo superadmin.");
  }
  return profile;
}
