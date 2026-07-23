import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { isOrganizationRole } from "@/modules/auth/types";

import type { MyOrganizationMember } from "../types";
import { requireOrgOperator } from "./createOrganizationMember.server";

const updateMemberBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
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

type OrgService = Awaited<ReturnType<typeof requireOrgOperator>>["service"];

async function syncViewerLoanShares(params: {
  service: OrgService;
  organizationId: string;
  userId: string;
  shareAllLoans: boolean;
  loanIds: string[];
}): Promise<{ sharedLoanCount: number; sharedLoanIds: string[] }> {
  const { service, organizationId, userId, shareAllLoans } = params;
  let loanIds = params.loanIds;

  const { data: orgLoans, error: orgLoansError } = await service
    .from("loans")
    .select("id")
    .eq("organization_id", organizationId);

  if (orgLoansError) {
    throw new ApiError(500, "INTERNAL_ERROR", orgLoansError.message);
  }

  const orgLoanIds = ((orgLoans ?? []) as { id: string }[]).map((row) => row.id);

  if (shareAllLoans) {
    loanIds = orgLoanIds;
  } else {
    const selected = new Set(loanIds);
    loanIds = orgLoanIds.filter((id) => selected.has(id));
    if (loanIds.length === 0) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Ningún préstamo válido para compartir.",
      );
    }
  }

  if (orgLoanIds.length > 0) {
    const { error: deleteError } = await service
      .from("loan_shares")
      .delete()
      .eq("user_id", userId)
      .in("loan_id", orgLoanIds);

    if (deleteError) {
      throw new ApiError(500, "INTERNAL_ERROR", deleteError.message);
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
  }

  return {
    sharedLoanCount: loanIds.length,
    sharedLoanIds: shareAllLoans ? [] : loanIds,
  };
}

async function clearOrgLoanShares(params: {
  service: OrgService;
  organizationId: string;
  userId: string;
}) {
  const { service, organizationId, userId } = params;
  const { data: orgLoans, error: orgLoansError } = await service
    .from("loans")
    .select("id")
    .eq("organization_id", organizationId);

  if (orgLoansError) {
    throw new ApiError(500, "INTERNAL_ERROR", orgLoansError.message);
  }

  const orgLoanIds = ((orgLoans ?? []) as { id: string }[]).map((row) => row.id);
  if (orgLoanIds.length === 0) {
    return;
  }

  const { error: deleteError } = await service
    .from("loan_shares")
    .delete()
    .eq("user_id", userId)
    .in("loan_id", orgLoanIds);

  if (deleteError) {
    throw new ApiError(500, "INTERNAL_ERROR", deleteError.message);
  }
}

export async function updateOrganizationMember(
  organizationId: string,
  userId: string,
  body: unknown,
): Promise<MyOrganizationMember> {
  const { service } = await requireOrgOperator(organizationId);
  const parsed = updateMemberBodySchema.parse(body);

  const { data: target, error: targetError } = await service
    .from("organization_members")
    .select("role, share_all_loans")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle<{ role: string; share_all_loans: boolean | null }>();

  if (targetError) {
    throw new ApiError(500, "INTERNAL_ERROR", targetError.message);
  }
  if (!target || !isOrganizationRole(target.role)) {
    throw new ApiError(404, "NOT_FOUND", "Miembro no encontrado.");
  }
  if (target.role === "owner") {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "No se puede editar el owner desde aquí.",
    );
  }

  const { error: profileError } = await service
    .from("profiles")
    .update({ display_name: parsed.name })
    .eq("user_id", userId);

  if (profileError) {
    throw new ApiError(500, "INTERNAL_ERROR", profileError.message);
  }

  await service.auth.admin.updateUserById(userId, {
    user_metadata: { display_name: parsed.name },
  });

  const shareAllLoans =
    parsed.role === "viewer" ? Boolean(parsed.shareAllLoans) : false;

  const { error: memberError } = await service
    .from("organization_members")
    .update({
      role: parsed.role,
      share_all_loans: shareAllLoans,
    })
    .eq("organization_id", organizationId)
    .eq("user_id", userId);

  if (memberError) {
    throw new ApiError(500, "INTERNAL_ERROR", memberError.message);
  }

  let sharedLoanCount = 0;
  let sharedLoanIds: string[] = [];

  if (parsed.role === "viewer") {
    const synced = await syncViewerLoanShares({
      service,
      organizationId,
      userId,
      shareAllLoans,
      loanIds: parsed.loanIds,
    });
    sharedLoanCount = synced.sharedLoanCount;
    sharedLoanIds = synced.sharedLoanIds;
  } else {
    await clearOrgLoanShares({ service, organizationId, userId });
  }

  const { data: authUser } = await service.auth.admin.getUserById(userId);

  return {
    userId,
    name: parsed.name,
    email: authUser.user?.email ?? null,
    role: parsed.role,
    shareAllLoans,
    sharedLoanCount,
    sharedLoanIds,
  };
}
