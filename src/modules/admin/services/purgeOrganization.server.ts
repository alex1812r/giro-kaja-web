import { ApiError } from "@/lib/api/apiError";
import type { createServiceRoleClient } from "@/lib/supabase/service-client";

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

async function assertOk(
  error: { message: string } | null,
  context: string,
): Promise<void> {
  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", `${context}: ${error.message}`);
  }
}

/**
 * Hard-deletes all tenant data for an organization, then the organization row.
 * Members cascade via FK; profiles.default_organization_id is SET NULL.
 * Must run with service role (bypasses RLS).
 */
export async function purgeOrganizationById(
  service: ServiceClient,
  organizationId: string,
): Promise<void> {
  const { data: loans, error: loansSelectError } = await service
    .from("loans")
    .select("id")
    .eq("organization_id", organizationId);
  await assertOk(loansSelectError, "Listar préstamos");

  const loanIds = (loans ?? []).map((row) => row.id as string);
  if (loanIds.length > 0) {
    await assertOk(
      (await service.from("payments").delete().in("loan_id", loanIds)).error,
      "Borrar pagos",
    );
    await assertOk(
      (await service.from("loan_shares").delete().in("loan_id", loanIds)).error,
      "Borrar shares de préstamos",
    );
  }

  await assertOk(
    (
      await service.from("loans").delete().eq("organization_id", organizationId)
    ).error,
    "Borrar préstamos",
  );

  const { data: debts, error: debtsSelectError } = await service
    .from("debts")
    .select("id")
    .eq("organization_id", organizationId);
  await assertOk(debtsSelectError, "Listar deudas");

  const debtIds = (debts ?? []).map((row) => row.id as string);
  if (debtIds.length > 0) {
    await assertOk(
      (
        await service.from("debt_payments").delete().in("debt_id", debtIds)
      ).error,
      "Borrar pagos de deudas",
    );
  }

  await assertOk(
    (
      await service.from("debts").delete().eq("organization_id", organizationId)
    ).error,
    "Borrar deudas",
  );

  await assertOk(
    (
      await service
        .from("clients")
        .delete()
        .eq("organization_id", organizationId)
    ).error,
    "Borrar clientes",
  );
  await assertOk(
    (
      await service
        .from("transactions")
        .delete()
        .eq("organization_id", organizationId)
    ).error,
    "Borrar transacciones",
  );
  await assertOk(
    (
      await service
        .from("notifications")
        .delete()
        .eq("organization_id", organizationId)
    ).error,
    "Borrar notificaciones",
  );
  await assertOk(
    (
      await service
        .from("vault_balances")
        .delete()
        .eq("organization_id", organizationId)
    ).error,
    "Borrar saldos de caja",
  );

  // Legacy vault table (optional)
  try {
    await service.from("vault").delete().eq("organization_id", organizationId);
  } catch {
    // Table may not exist
  }

  await assertOk(
    (
      await service
        .from("profiles")
        .update({
          default_organization_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("default_organization_id", organizationId)
    ).error,
    "Limpiar default_organization_id",
  );

  const { error: orgError } = await service
    .from("organizations")
    .delete()
    .eq("id", organizationId);

  await assertOk(orgError, "Borrar organización");
}

/** Orgs where this user is the sole owner/admin (viewers do not count as operators). */
export async function findOrgsWhereUserIsSoleOperator(
  service: ServiceClient,
  userId: string,
): Promise<string[]> {
  const { data: memberships, error } = await service
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const operatorMemberships = (memberships ?? []).filter(
    (m) => m.role === "owner" || m.role === "admin",
  );

  const soleOrgIds: string[] = [];

  for (const membership of operatorMemberships) {
    const orgId = membership.organization_id as string;
    const { data: operators, error: opError } = await service
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", orgId)
      .in("role", ["owner", "admin"]);

    if (opError) {
      throw new ApiError(500, "INTERNAL_ERROR", opError.message);
    }

    const others = (operators ?? []).filter((row) => row.user_id !== userId);
    if (others.length === 0) {
      soleOrgIds.push(orgId);
    }
  }

  return soleOrgIds;
}
