import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";
import {
  theoreticalInterestOnePeriod,
  theoreticalPrincipalPlusInterestOnePeriod,
} from "@/shared/utils/theoreticalInterestPeriod";

import type {
  LoanListItem,
  LoanStatus,
  LoansOverview,
} from "../types";

const UPCOMING_LIMIT = 10;

type LoanRow = {
  id: string;
  initial_amount: number | string;
  current_principal: number | string;
  interest_rate: number | string;
  currency: string | null;
  next_payment_date: string;
  status: string;
  description: string | null;
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

export async function getLoansOverview(
  currencyParam: string | null,
): Promise<LoansOverview> {
  const currency: CurrencyCode = isCurrencyCode(currencyParam ?? "")
    ? (currencyParam as CurrencyCode)
    : "USD";

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const { data, error } = await supabase
    .from("loans")
    .select(
      "id, initial_amount, current_principal, interest_rate, currency, next_payment_date, status, description, clients(name, last_name)",
    )
    .eq("currency", currency)
    .order("next_payment_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const loans = (data ?? []) as LoanRow[];
  const activeOrOverdue = loans.filter(
    (loan) => loan.status === "active" || loan.status === "overdue",
  );

  const totalLent = activeOrOverdue.reduce(
    (sum, loan) => sum + asNumber(loan.current_principal),
    0,
  );
  const interestGain = activeOrOverdue.reduce(
    (sum, loan) =>
      sum +
      theoreticalInterestOnePeriod(
        asNumber(loan.initial_amount),
        asNumber(loan.interest_rate),
      ),
    0,
  );
  const projectionNextMonth = activeOrOverdue.reduce(
    (sum, loan) =>
      sum +
      theoreticalPrincipalPlusInterestOnePeriod(
        asNumber(loan.initial_amount),
        asNumber(loan.interest_rate),
      ),
    0,
  );

  const upcomingLoans: LoanListItem[] = loans
    .slice(0, UPCOMING_LIMIT)
    .map((loan) => ({
      id: loan.id,
      clientName: clientName(loan.clients),
      description: loan.description?.trim() || null,
      nextPaymentDate: loan.next_payment_date,
      interestRate: asNumber(loan.interest_rate),
      currentPrincipal: asNumber(loan.current_principal),
      status: asLoanStatus(loan.status),
      currency: loan.currency ?? currency,
    }));

  return {
    metrics: {
      totalLent,
      projectionNextMonth,
      interestGain,
      activeCount: activeOrOverdue.filter((l) => l.status === "active").length,
      overdueCount: activeOrOverdue.filter((l) => l.status === "overdue").length,
    },
    upcomingLoans,
  };
}
