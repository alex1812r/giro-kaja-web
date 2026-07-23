import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { getAuthProfileFromSession } from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";
import { isSuperadmin, type AuthOrganization } from "@/modules/auth/types";

const createOrganizationBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export async function createOrganizationForCurrentUser(
  body: unknown,
): Promise<AuthOrganization> {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (isSuperadmin(profile)) {
    throw new ApiError(403, "FORBIDDEN", "El superadmin no crea organizaciones.");
  }

  const parsed = createOrganizationBodySchema.parse(body);
  const service = createServiceRoleClient();

  const { data: org, error: orgError } = await service
    .from("organizations")
    .insert({
      name: parsed.name,
      created_by: profile.id,
    })
    .select("id, name")
    .single();

  if (orgError || !org) {
    throw new ApiError(
      500,
      "INTERNAL_ERROR",
      orgError?.message ?? "No se pudo crear la organización.",
    );
  }

  const { error: memberError } = await service.from("organization_members").insert({
    organization_id: org.id,
    user_id: profile.id,
    role: "owner",
    invited_by: profile.id,
  });

  if (memberError) {
    throw new ApiError(500, "INTERNAL_ERROR", memberError.message);
  }

  const { error: profileError } = await service
    .from("profiles")
    .update({
      default_organization_id: org.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.id);

  if (profileError) {
    throw new ApiError(500, "INTERNAL_ERROR", profileError.message);
  }

  const { error: vaultError } = await service.rpc("ensure_vault_for_organization", {
    p_organization_id: org.id,
  });

  if (vaultError) {
    // Fallback: ensure_vault_for_user also ensures personal org buckets
    const { error: vaultUserError } = await service.rpc("ensure_vault_for_user", {
      p_user_id: profile.id,
    });
    if (vaultUserError) {
      throw new ApiError(500, "INTERNAL_ERROR", vaultUserError.message);
    }
  }

  return {
    id: org.id,
    name: org.name?.trim() || parsed.name,
  };
}
