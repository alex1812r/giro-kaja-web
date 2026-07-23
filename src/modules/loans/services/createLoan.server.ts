import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { requireOperatorFromSession } from "@/lib/supabase/auth/profile.server";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

import type { LoanListItem } from "../types";

const createLoanBodySchema = z
  .object({
    clientId: z.string().uuid(),
    initialAmount: z.number().positive(),
    interestRate: z.number().min(0).max(100),
    currency: z.string().min(1),
    issueDate: z.string().min(1),
    nextPaymentDate: z.string().min(1),
    description: z.string().max(500).optional().nullable(),
  })
  .refine((data) => data.nextPaymentDate >= data.issueDate, {
    message: "validation.dateRangeInvalid",
    path: ["nextPaymentDate"],
  });

export type CreateLoanBody = z.infer<typeof createLoanBodySchema>;

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function createLoan(body: unknown): Promise<LoanListItem> {
  const parsed = createLoanBodySchema.parse(body);
  const currency: CurrencyCode = isCurrencyCode(parsed.currency)
    ? parsed.currency
    : "USD";

  const operator = await requireOperatorFromSession();
  const supabase = await createRouteSupabaseClient();
  const user = { id: operator.id };

  const { data: vault, error: vaultError } = await supabase
    .from("vault_balances")
    .select("balance")
    .eq("currency", currency)
    .maybeSingle();

  if (vaultError) {
    throw new ApiError(500, "INTERNAL_ERROR", vaultError.message);
  }

  const balance = asNumber(vault?.balance);
  if (balance < parsed.initialAmount) {
    throw new ApiError(
      400,
      "INSUFFICIENT_BALANCE",
      "Saldo insuficiente en caja.",
    );
  }

  const description = parsed.description?.trim() || null;

  const { data, error } = await supabase
    .from("loans")
    .insert({
      user_id: user.id,
      ...(operator.organization
        ? { organization_id: operator.organization.id }
        : {}),
      client_id: parsed.clientId,
      initial_amount: parsed.initialAmount,
      current_principal: parsed.initialAmount,
      interest_rate: parsed.interestRate,
      currency,
      issue_date: parsed.issueDate.slice(0, 10),
      next_payment_date: parsed.nextPaymentDate.slice(0, 10),
      status: "active",
      description,
    })
    .select(
      "id, current_principal, interest_rate, currency, next_payment_date, status, clients(name, last_name)",
    )
    .single();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const clients = Array.isArray(data.clients) ? data.clients[0] : data.clients;
  const clientName = clients
    ? [clients.name, clients.last_name].filter(Boolean).join(" ").trim() || "—"
    : "—";

  return {
    id: data.id,
    clientName,
    nextPaymentDate: data.next_payment_date,
    interestRate: asNumber(data.interest_rate),
    currentPrincipal: asNumber(data.current_principal),
    status: "active",
    currency: data.currency ?? currency,
  };
}
