import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

import type {
  LoanDetail,
  LoanDetailResponse,
  LoanPayment,
  LoanStatus,
} from "../types";

type ClientJoin =
  | { name: string; last_name: string | null }
  | { name: string; last_name: string | null }[]
  | null;

type LoanRow = {
  id: string;
  initial_amount: number | string;
  current_principal: number | string;
  interest_rate: number | string;
  currency: string | null;
  next_payment_date: string;
  status: string;
  description: string | null;
  clients: ClientJoin;
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

function clientName(clients: ClientJoin): string {
  const client = Array.isArray(clients) ? clients[0] : clients;

  if (!client) {
    return "—";
  }

  return [client.name, client.last_name].filter(Boolean).join(" ").trim() || "—";
}

function asLoanStatus(status: string): LoanStatus {
  if (status === "overdue" || status === "paid") {
    return status;
  }

  return "active";
}

export async function getLoanDetail(loanId: string): Promise<LoanDetailResponse> {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const [loanResult, paymentsResult] = await Promise.all([
    supabase
      .from("loans")
      .select(
        "id, initial_amount, current_principal, interest_rate, currency, next_payment_date, status, description, clients(name, last_name)",
      )
      .eq("id", loanId)
      .maybeSingle(),
    supabase
      .from("payments")
      .select(
        "id, total_amount_paid, interest_amount, amortization_amount, payment_date, status, description",
      )
      .eq("loan_id", loanId)
      .eq("status", "paid")
      .order("payment_date", { ascending: false }),
  ]);

  if (loanResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", loanResult.error.message);
  }

  if (!loanResult.data) {
    throw new ApiError(404, "NOT_FOUND", "Préstamo no encontrado.");
  }

  if (paymentsResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", paymentsResult.error.message);
  }

  const row = loanResult.data as LoanRow;

  const loan: LoanDetail = {
    id: row.id,
    clientName: clientName(row.clients),
    status: asLoanStatus(row.status),
    currency: row.currency ?? "USD",
    currentPrincipal: asNumber(row.current_principal),
    initialAmount: asNumber(row.initial_amount),
    interestRate: asNumber(row.interest_rate),
    nextPaymentDate: row.next_payment_date,
    description: row.description?.trim() || null,
  };

  const payments: LoanPayment[] = ((paymentsResult.data ?? []) as PaymentRow[]).map(
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

  return { loan, payments };
}
