import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import {
  getAuthProfileFromSession,
  getProfileByUserId,
  type ServerAuthProfile,
} from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";
import { isSuperadmin } from "@/modules/auth/types";

const switchBodySchema = z.object({
  organizationId: z.string().uuid(),
});

export async function switchActiveOrganizationForCurrentUser(
  body: unknown,
): Promise<ServerAuthProfile> {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (isSuperadmin(profile)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "El superadmin no opera dentro de una organización.",
    );
  }

  const parsed = switchBodySchema.parse(body);

  if (profile.organization?.id === parsed.organizationId) {
    return profile;
  }

  const membership = profile.memberships.find(
    (m) => m.organization.id === parsed.organizationId,
  );
  if (!membership) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "No perteneces a esa organización.",
    );
  }

  const service = createServiceRoleClient();

  const { data: memberRow, error: memberError } = await service
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", profile.id)
    .eq("organization_id", parsed.organizationId)
    .maybeSingle();

  if (memberError) {
    throw new ApiError(500, "INTERNAL_ERROR", memberError.message);
  }
  if (!memberRow) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "No perteneces a esa organización.",
    );
  }

  const { error: profileError } = await service
    .from("profiles")
    .update({
      default_organization_id: parsed.organizationId,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.id);

  if (profileError) {
    throw new ApiError(500, "INTERNAL_ERROR", profileError.message);
  }

  const refreshed = await getProfileByUserId(profile.id, profile.email);
  if (!refreshed) {
    throw new ApiError(500, "INTERNAL_ERROR", "No se pudo recargar la sesión.");
  }

  return refreshed;
}
