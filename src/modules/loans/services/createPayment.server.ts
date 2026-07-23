import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { requireOperatorFromSession } from "@/lib/supabase/auth/profile.server";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

import type { LoanPayment } from "../types";

const createPaymentBodySchema = z.object({
  paymentDate: z.string().min(1),
  amountPaid: z.number().positive(),
  description: z.string().max(500).optional().nullable(),
});

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function createLoanPayment(
  loanId: string,
  body: unknown,
): Promise<LoanPayment> {
  const parsed = createPaymentBodySchema.parse(body);

  await requireOperatorFromSession();
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, current_principal, interest_rate, status")
    .eq("id", loanId)
    .maybeSingle();

  if (loanError) {
    throw new ApiError(500, "INTERNAL_ERROR", loanError.message);
  }

  if (!loan) {
    throw new ApiError(404, "NOT_FOUND", "Préstamo no encontrado.");
  }

  if (loan.status === "paid" || asNumber(loan.current_principal) <= 0) {
    throw new ApiError(400, "BAD_REQUEST", "Este préstamo ya está pagado.");
  }

  const currentPrincipal = asNumber(loan.current_principal);
  const interestRate = asNumber(loan.interest_rate);
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
    .from("payments")
    .insert({
      loan_id: loanId,
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
