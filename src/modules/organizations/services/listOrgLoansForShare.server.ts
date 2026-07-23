import { ApiError } from "@/lib/api/apiError";
import { getAuthProfileFromSession } from "@/lib/supabase/auth/profile.server";
import { createServiceRoleClient } from "@/lib/supabase/service-client";
import { isOperatorRole, isSuperadmin } from "@/modules/auth/types";

import type { OrgLoanShareOption } from "../types";

type LoanRow = {
  id: string;
  current_principal: number | string;
  currency: string | null;
  status: string;
  next_payment_date: string;
  clients:
    | { name: string; last_name: string | null }
    | { name: string; last_name: string | null }[]
    | null;
};

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function clientName(clients: LoanRow["clients"]): string {
  const client = Array.isArray(clients) ? clients[0] : clients;
  if (!client) return "—";
  return [client.name, client.last_name].filter(Boolean).join(" ").trim() || "—";
}

export async function listOrgLoansForShare(
  organizationId: string,
): Promise<OrgLoanShareOption[]> {
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
  if (!membership || !isOperatorRole(membership.role as "owner" | "admin")) {
    throw new ApiError(403, "FORBIDDEN", "Solo owner o admin.");
  }

  const { data, error } = await service
    .from("loans")
    .select(
      "id, current_principal, currency, status, next_payment_date, clients(name, last_name)",
    )
    .eq("organization_id", organizationId)
    .in("status", ["active", "overdue"])
    .order("next_payment_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return ((data ?? []) as LoanRow[]).map((loan) => ({
    id: loan.id,
    clientName: clientName(loan.clients),
    currentPrincipal: asNumber(loan.current_principal),
    currency: loan.currency ?? "USD",
    status: loan.status,
    nextPaymentDate: loan.next_payment_date,
  }));
}
