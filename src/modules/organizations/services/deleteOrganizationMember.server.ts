import { ApiError } from "@/lib/api/apiError";
import { isOrganizationRole } from "@/modules/auth/types";

import { requireOrgOperator } from "./createOrganizationMember.server";

export async function deleteOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<{ deletedUserId: string }> {
  const { profile, service } = await requireOrgOperator(organizationId);

  if (userId === profile.id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "No puedes eliminarte a ti mismo de la organización.",
    );
  }

  const { data: target, error: targetError } = await service
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle<{ role: string }>();

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
      "No se puede eliminar al owner de la organización.",
    );
  }

  const { data: orgLoans, error: orgLoansError } = await service
    .from("loans")
    .select("id")
    .eq("organization_id", organizationId);

  if (orgLoansError) {
    throw new ApiError(500, "INTERNAL_ERROR", orgLoansError.message);
  }

  const orgLoanIds = ((orgLoans ?? []) as { id: string }[]).map((row) => row.id);
  if (orgLoanIds.length > 0) {
    const { error: sharesError } = await service
      .from("loan_shares")
      .delete()
      .eq("user_id", userId)
      .in("loan_id", orgLoanIds);

    if (sharesError) {
      throw new ApiError(500, "INTERNAL_ERROR", sharesError.message);
    }
  }

  const { error: memberError } = await service
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", userId);

  if (memberError) {
    throw new ApiError(500, "INTERNAL_ERROR", memberError.message);
  }

  const { data: profileRow } = await service
    .from("profiles")
    .select("default_organization_id")
    .eq("user_id", userId)
    .maybeSingle<{ default_organization_id: string | null }>();

  if (profileRow?.default_organization_id === organizationId) {
    const { data: otherMembership } = await service
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<{ organization_id: string }>();

    await service
      .from("profiles")
      .update({
        default_organization_id: otherMembership?.organization_id ?? null,
      })
      .eq("user_id", userId);
  }

  return { deletedUserId: userId };
}
