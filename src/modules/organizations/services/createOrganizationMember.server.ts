import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { getAuthProfileFromSession } from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";
import {
  isOperatorRole,
  isSuperadmin,
} from "@/modules/auth/types";

import type { MyOrganizationMember } from "../types";

const createMemberBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(["admin", "viewer"]),
    shareAllLoans: z.boolean().optional().default(false),
    loanIds: z.array(z.string().uuid()).optional().default([]),
  })
  .superRefine((value, ctx) => {
    if (value.role === "viewer" && !value.shareAllLoans && value.loanIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona al menos un préstamo o comparte todos.",
        path: ["loanIds"],
      });
    }
  });

export async function requireOrgOperator(organizationId: string) {
  const profile = await getAuthProfileFromSession();
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }
  if (isSuperadmin(profile)) {
    throw new ApiError(403, "FORBIDDEN", "No disponible para superadmin.");
  }

  const service = createServiceRoleClient();
  const { data: membership, error } = await service
    .from("organization_members")
    .select("role")
    .eq("user_id", profile.id)
    .eq("organization_id", organizationId)
    .maybeSingle<{ role: string }>();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }
  if (!membership || !isOperatorRole(membership.role as "owner" | "admin")) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Solo owner o admin pueden gestionar miembros.",
    );
  }

  return { profile, service, actorRole: membership.role };
}

export async function createOrganizationMember(
  organizationId: string,
  body: unknown,
): Promise<MyOrganizationMember> {
  const { profile, service } = await requireOrgOperator(organizationId);
  const parsed = createMemberBodySchema.parse(body);

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
    default_organization_id: organizationId,
  });

  if (profileError) {
    await service.auth.admin.deleteUser(userId);
    throw new ApiError(500, "INTERNAL_ERROR", profileError.message);
  }

  const shareAllLoans =
    parsed.role === "viewer" ? Boolean(parsed.shareAllLoans) : false;

  const { error: memberError } = await service.from("organization_members").insert({
    organization_id: organizationId,
    user_id: userId,
    role: parsed.role,
    invited_by: profile.id,
    share_all_loans: shareAllLoans,
  });

  if (memberError) {
    await service.auth.admin.deleteUser(userId);
    throw new ApiError(500, "INTERNAL_ERROR", memberError.message);
  }

  let sharedLoanCount = 0;
  let sharedLoanIds: string[] = [];

  if (parsed.role === "viewer") {
    let loanIds = parsed.loanIds;

    if (shareAllLoans) {
      const { data: loans, error: loansError } = await service
        .from("loans")
        .select("id")
        .eq("organization_id", organizationId);

      if (loansError) {
        throw new ApiError(500, "INTERNAL_ERROR", loansError.message);
      }
      loanIds = (loans ?? []).map((row) => row.id as string);
    } else {
      const { data: validLoans, error: validError } = await service
        .from("loans")
        .select("id")
        .eq("organization_id", organizationId)
        .in("id", loanIds.length ? loanIds : ["00000000-0000-0000-0000-000000000000"]);

      if (validError) {
        throw new ApiError(500, "INTERNAL_ERROR", validError.message);
      }
      loanIds = (validLoans ?? []).map((row) => row.id as string);
      if (loanIds.length === 0) {
        throw new ApiError(
          400,
          "BAD_REQUEST",
          "Ningún préstamo válido para compartir.",
        );
      }
    }

    if (loanIds.length > 0) {
      const rows = loanIds.map((loanId) => ({
        loan_id: loanId,
        user_id: userId,
        permission: "view" as const,
      }));
      const { error: sharesError } = await service
        .from("loan_shares")
        .upsert(rows, { onConflict: "loan_id,user_id" });

      if (sharesError) {
        throw new ApiError(500, "INTERNAL_ERROR", sharesError.message);
      }
      sharedLoanCount = loanIds.length;
      if (!shareAllLoans) {
        sharedLoanIds = loanIds;
      }
    }
  }

  return {
    userId,
    name: parsed.name,
    email: parsed.email,
    role: parsed.role,
    shareAllLoans,
    sharedLoanCount,
    sharedLoanIds,
  };
}
