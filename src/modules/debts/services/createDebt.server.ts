import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

import type { DebtListItem } from "../types";

const createDebtBodySchema = z
  .object({
    lender: z.string().trim().min(1),
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

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function createDebt(body: unknown): Promise<DebtListItem> {
  const parsed = createDebtBodySchema.parse(body);
  const currency: CurrencyCode = isCurrencyCode(parsed.currency)
    ? parsed.currency
    : "USD";

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const description = parsed.description?.trim() || null;

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      lender: parsed.lender.trim(),
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
      "id, lender, current_principal, interest_rate, currency, next_payment_date, status",
    )
    .single();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return {
    id: data.id,
    lender: data.lender?.trim() || "—",
    nextPaymentDate: data.next_payment_date,
    interestRate: asNumber(data.interest_rate),
    currentPrincipal: asNumber(data.current_principal),
    status: "active",
    currency: data.currency ?? currency,
  };
}
