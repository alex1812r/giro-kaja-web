import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

import type { DebtPayment } from "../types";

const createPaymentBodySchema = z.object({
  paymentDate: z.string().min(1),
  amountPaid: z.number().positive(),
  description: z.string().max(500).optional().nullable(),
});

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function createDebtPayment(
  debtId: string,
  body: unknown,
): Promise<DebtPayment> {
  const parsed = createPaymentBodySchema.parse(body);

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const { data: debt, error: debtError } = await supabase
    .from("debts")
    .select("id, current_principal, interest_rate, status, currency")
    .eq("id", debtId)
    .maybeSingle();

  if (debtError) {
    throw new ApiError(500, "INTERNAL_ERROR", debtError.message);
  }

  if (!debt) {
    throw new ApiError(404, "NOT_FOUND", "Deuda no encontrada.");
  }

  if (debt.status === "paid" || asNumber(debt.current_principal) <= 0) {
    throw new ApiError(400, "BAD_REQUEST", "Esta deuda ya está pagada.");
  }

  const currency = debt.currency ?? "USD";
  const { data: vault, error: vaultError } = await supabase
    .from("vault_balances")
    .select("balance")
    .eq("currency", currency)
    .maybeSingle();

  if (vaultError) {
    throw new ApiError(500, "INTERNAL_ERROR", vaultError.message);
  }

  const balance = asNumber(vault?.balance);
  if (balance < parsed.amountPaid) {
    throw new ApiError(
      400,
      "INSUFFICIENT_BALANCE",
      "Saldo insuficiente en caja.",
    );
  }

  const currentPrincipal = asNumber(debt.current_principal);
  const interestRate = asNumber(debt.interest_rate);
  const expectedInterest = (currentPrincipal * interestRate) / 100;

  if (parsed.amountPaid < expectedInterest) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "El monto debe cubrir al menos el interés debido.",
    );
  }

  const amortizationAmount = Math.max(0, parsed.amountPaid - expectedInterest);
  const description = parsed.description?.trim() || null;

  const { data, error } = await supabase
    .from("debt_payments")
    .insert({
      debt_id: debtId,
      total_amount_paid: parsed.amountPaid,
      interest_amount: expectedInterest,
      amortization_amount: amortizationAmount,
      payment_date: parsed.paymentDate.slice(0, 10),
      status: "paid",
      description,
    })
    .select(
      "id, total_amount_paid, interest_amount, amortization_amount, payment_date, status, description",
    )
    .single();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return {
    id: data.id,
    paymentDate: String(data.payment_date).slice(0, 10),
    interestAmount: asNumber(data.interest_amount),
    amortizationAmount: asNumber(data.amortization_amount),
    totalAmount: asNumber(data.total_amount_paid),
    status: "paid",
    description: data.description,
  };
}
