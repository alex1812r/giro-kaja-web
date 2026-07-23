import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";
import {
  theoreticalInterestOnePeriod,
  theoreticalPrincipalPlusInterestOnePeriod,
} from "@/shared/utils/theoreticalInterestPeriod";

import type { DebtListItem, DebtStatus, DebtsOverview } from "../types";

const UPCOMING_LIMIT = 10;

type DebtRow = {
  id: string;
  lender: string;
  initial_amount: number | string;
  current_principal: number | string;
  interest_rate: number | string;
  currency: string | null;
  next_payment_date: string;
  status: string;
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

export async function getDebtsOverview(
  currencyParam: string | null,
): Promise<DebtsOverview> {
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
    .from("debts")
    .select(
      "id, lender, initial_amount, current_principal, interest_rate, currency, next_payment_date, status",
    )
    .eq("currency", currency)
    .order("next_payment_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const debts = (data ?? []) as DebtRow[];
  const activeOrOverdue = debts.filter(
    (debt) => debt.status === "active" || debt.status === "overdue",
  );

  const totalOwed = activeOrOverdue.reduce(
    (sum, debt) => sum + asNumber(debt.current_principal),
    0,
  );
  const interestCost = activeOrOverdue.reduce(
    (sum, debt) =>
      sum +
      theoreticalInterestOnePeriod(
        asNumber(debt.initial_amount),
        asNumber(debt.interest_rate),
      ),
    0,
  );
  const projectionNextMonth = activeOrOverdue.reduce(
    (sum, debt) =>
      sum +
      theoreticalPrincipalPlusInterestOnePeriod(
        asNumber(debt.initial_amount),
        asNumber(debt.interest_rate),
      ),
    0,
  );

  const upcomingDebts: DebtListItem[] = debts.slice(0, UPCOMING_LIMIT).map((debt) => ({
    id: debt.id,
    lender: debt.lender?.trim() || "—",
    nextPaymentDate: debt.next_payment_date,
    interestRate: asNumber(debt.interest_rate),
    currentPrincipal: asNumber(debt.current_principal),
    status: asDebtStatus(debt.status),
    currency: debt.currency ?? currency,
  }));

  return {
    metrics: {
      totalOwed,
      projectionNextMonth,
      interestCost,
      activeCount: activeOrOverdue.filter((d) => d.status === "active").length,
      overdueCount: activeOrOverdue.filter((d) => d.status === "overdue").length,
    },
    upcomingDebts,
  };
}
