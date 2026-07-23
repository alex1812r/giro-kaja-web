import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

import type {
  DebtDetail,
  DebtDetailResponse,
  DebtPayment,
  DebtStatus,
} from "../types";

type DebtRow = {
  id: string;
  lender: string;
  initial_amount: number | string;
  current_principal: number | string;
  interest_rate: number | string;
  currency: string | null;
  next_payment_date: string;
  status: string;
  description: string | null;
};

type PaymentRow = {
  id: string;
  total_amount_paid: number | string;
  interest_amount: number | string;
  amortization_amount: number | string;
  payment_date: string;
  status: string;
  description: string | null;
};

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function asDebtStatus(status: string): DebtStatus {
  if (status === "overdue" || status === "paid") {
    return status;
  }
  return "active";
}

export async function getDebtDetail(debtId: string): Promise<DebtDetailResponse> {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const [debtResult, paymentsResult] = await Promise.all([
    supabase
      .from("debts")
      .select(
        "id, lender, initial_amount, current_principal, interest_rate, currency, next_payment_date, status, description",
      )
      .eq("id", debtId)
      .maybeSingle(),
    supabase
      .from("debt_payments")
      .select(
        "id, total_amount_paid, interest_amount, amortization_amount, payment_date, status, description",
      )
      .eq("debt_id", debtId)
      .eq("status", "paid")
      .order("payment_date", { ascending: false }),
  ]);

  if (debtResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", debtResult.error.message);
  }

  if (!debtResult.data) {
    throw new ApiError(404, "NOT_FOUND", "Deuda no encontrada.");
  }

  if (paymentsResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", paymentsResult.error.message);
  }

  const row = debtResult.data as DebtRow;

  const debt: DebtDetail = {
    id: row.id,
    lender: row.lender?.trim() || "—",
    status: asDebtStatus(row.status),
    currency: row.currency ?? "USD",
    currentPrincipal: asNumber(row.current_principal),
    initialAmount: asNumber(row.initial_amount),
    interestRate: asNumber(row.interest_rate),
    nextPaymentDate: row.next_payment_date,
    description: row.description?.trim() || null,
  };

  const payments: DebtPayment[] = ((paymentsResult.data ?? []) as PaymentRow[]).map(
    (payment) => ({
      id: payment.id,
      paymentDate: payment.payment_date.slice(0, 10),
      interestAmount: asNumber(payment.interest_amount),
      amortizationAmount: asNumber(payment.amortization_amount),
      totalAmount: asNumber(payment.total_amount_paid),
      status: "paid",
      description: payment.description,
    }),
  );

  return { debt, payments };
}
