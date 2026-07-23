import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { requireSuperadminFromSession } from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";

import type { AdminUserListItem, AdminUserMembership } from "../types";
import {
  findOrgsWhereUserIsSoleOperator,
  purgeOrganizationById,
} from "./purgeOrganization.server";

const createAdminBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(120),
});

const patchUserBodySchema = z.object({
  isActive: z.boolean(),
});

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  system_role: string | null;
  is_active: boolean | null;
};

type MemberRow = {
  user_id: string;
  role: string;
  organization_id: string;
  organizations: { id: string; name: string } | { id: string; name: string }[] | null;
};

function orgFromJoin(
  value: MemberRow["organizations"],
): { id: string; name: string } | null {
  const org = Array.isArray(value) ? value[0] : value;
  if (!org?.id) return null;
  return { id: org.id, name: org.name?.trim() || "—" };
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  await requireSuperadminFromSession();
  const service = createServiceRoleClient();

  const { data: authData, error: authError } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (authError) {
    throw new ApiError(500, "INTERNAL_ERROR", authError.message);
  }

  const authUsers = authData.users ?? [];
  const ids = authUsers.map((u) => u.id);

  const { data: profiles, error: profilesError } = await service
    .from("profiles")
    .select("user_id, display_name, system_role, is_active")
    .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

  if (profilesError) {
    throw new ApiError(500, "INTERNAL_ERROR", profilesError.message);
  }

  const { data: members, error: membersError } = await service
    .from("organization_members")
    .select("user_id, role, organization_id, organizations(id, name)")
    .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

  if (membersError) {
    throw new ApiError(500, "INTERNAL_ERROR", membersError.message);
  }

  const profileMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((p) => [p.user_id, p]),
  );

  const membershipMap = new Map<string, AdminUserMembership[]>();
  for (const row of (members ?? []) as MemberRow[]) {
    const org = orgFromJoin(row.organizations);
    if (!org) continue;
    const list = membershipMap.get(row.user_id) ?? [];
    list.push({
      organizationId: org.id,
      organizationName: org.name,
      role: row.role,
    });
    membershipMap.set(row.user_id, list);
  }

  return authUsers.map((user) => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email ?? null,
      name:
        profile?.display_name?.trim() ||
        user.email ||
        user.id.slice(0, 8),
      systemRole: profile?.system_role ?? null,
      isActive: profile?.is_active !== false && !user.banned_until,
      memberships: membershipMap.get(user.id) ?? [],
      createdAt: user.created_at ?? null,
    };
  });
}

export async function createAdminUser(body: unknown): Promise<AdminUserListItem> {
  const actor = await requireSuperadminFromSession();
  const parsed = createAdminBodySchema.parse(body);
  const service = createServiceRoleClient();

  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: { display_name: parsed.name },
    });

  if (createError || !created.user) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      createError?.message ?? "No se pudo crear el usuario.",
    );
  }

  const userId = created.user.id;

  const { error: profileError } = await service.from("profiles").upsert({
    user_id: userId,
    display_name: parsed.name,
    is_active: true,
    system_role: null,
    default_organization_id: null,
  });

  if (profileError) {
    throw new ApiError(500, "INTERNAL_ERROR", profileError.message);
  }

  // Org + vault are created by the admin on first login via onboarding.
  void actor;

  const users = await listAdminUsers();
  const item = users.find((u) => u.id === userId);
  if (!item) {
    return {
      id: userId,
      email: parsed.email,
      name: parsed.name,
      systemRole: null,
      isActive: true,
      memberships: [],
      createdAt: created.user.created_at ?? null,
    };
  }
  return item;
}

export async function patchAdminUser(
  userId: string,
  body: unknown,
): Promise<AdminUserListItem> {
  const actor = await requireSuperadminFromSession();
  const parsed = patchUserBodySchema.parse(body);
  const service = createServiceRoleClient();

  if (userId === actor.id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "No puedes activar o desactivar tu propia cuenta.",
    );
  }

  const { error: profileError } = await service
    .from("profiles")
    .update({ is_active: parsed.isActive, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (profileError) {
    throw new ApiError(500, "INTERNAL_ERROR", profileError.message);
  }

  const { error: banError } = await service.auth.admin.updateUserById(userId, {
    ban_duration: parsed.isActive ? "none" : "876000h",
  });

  if (banError) {
    throw new ApiError(500, "INTERNAL_ERROR", banError.message);
  }

  const users = await listAdminUsers();
  const item = users.find((u) => u.id === userId);
  if (!item) {
    throw new ApiError(404, "NOT_FOUND", "Usuario no encontrado.");
  }
  return item;
}

export type DeleteAdminUserResult = {
  deletedUserId: string;
  deletedOrganizationIds: string[];
};

/**
 * Deletes a tenant user (admin/viewer). Cannot delete self or superadmin.
 * If the user is the sole owner/admin of an organization, that org and all
 * its data are purged first.
 */
export async function deleteAdminUser(
  userId: string,
): Promise<DeleteAdminUserResult> {
  const actor = await requireSuperadminFromSession();
  const service = createServiceRoleClient();

  if (userId === actor.id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "No puedes eliminar tu propia cuenta.",
    );
  }

  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("system_role")
    .eq("user_id", userId)
    .maybeSingle<{ system_role: string | null }>();

  if (profileError) {
    throw new ApiError(500, "INTERNAL_ERROR", profileError.message);
  }

  if (profile?.system_role === "superadmin") {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "No se puede eliminar un usuario superadmin desde la consola.",
    );
  }

  const { data: authUser, error: authLookupError } =
    await service.auth.admin.getUserById(userId);

  if (authLookupError || !authUser.user) {
    throw new ApiError(404, "NOT_FOUND", "Usuario no encontrado.");
  }

  const soleOrgIds = await findOrgsWhereUserIsSoleOperator(service, userId);

  for (const orgId of soleOrgIds) {
    await purgeOrganizationById(service, orgId);
  }

  const { error: membersError } = await service
    .from("organization_members")
    .delete()
    .eq("user_id", userId);

  if (membersError) {
    throw new ApiError(500, "INTERNAL_ERROR", membersError.message);
  }

  const { error: deleteProfileError } = await service
    .from("profiles")
    .delete()
    .eq("user_id", userId);

  if (deleteProfileError) {
    throw new ApiError(500, "INTERNAL_ERROR", deleteProfileError.message);
  }

  const { error: deleteAuthError } =
    await service.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    throw new ApiError(500, "INTERNAL_ERROR", deleteAuthError.message);
  }

  return {
    deletedUserId: userId,
    deletedOrganizationIds: soleOrgIds,
  };
}
