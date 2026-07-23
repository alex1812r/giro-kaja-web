import { ApiError } from "@/lib/api/apiError";
import {
  getAuthProfileFromSession,
  getProfileByUserId,
  type ServerAuthProfile,
} from "@/lib/supabase/auth/profile.server";
import { purgeOrganizationById } from "@/modules/admin/services/purgeOrganization.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";
import { isSuperadmin } from "@/modules/auth/types";

export type DeleteMyOrganizationResult = {
  deletedOrganizationId: string;
  user: ServerAuthProfile;
};

/**
 * Tenant owner deletes their organization (full data purge).
 * Remaining memberships keep the user in-app; if none left → onboarding.
 */
export async function deleteMyOrganization(
  organizationId: string,
): Promise<DeleteMyOrganizationResult> {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (isSuperadmin(profile)) {
    throw new ApiError(403, "FORBIDDEN", "No disponible para superadmin.");
  }

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
  if (!membership) {
    throw new ApiError(403, "FORBIDDEN", "No perteneces a esa organización.");
  }
  if (membership.role !== "owner") {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Solo el owner puede eliminar la organización.",
    );
  }

  const wasActive = profile.organization?.id === organizationId;

  await purgeOrganizationById(service, organizationId);

  if (wasActive) {
    const { data: nextMember } = await service
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<{ organization_id: string }>();

    await service
      .from("profiles")
      .update({
        default_organization_id: nextMember?.organization_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id);
  }

  const user = await getProfileByUserId(profile.id, profile.email);
  if (!user) {
    throw new ApiError(500, "INTERNAL_ERROR", "No se pudo recargar la sesión.");
  }

  return {
    deletedOrganizationId: organizationId,
    user,
  };
}
