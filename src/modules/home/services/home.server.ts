import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";
import { theoreticalInterestOnePeriod } from "@/shared/utils/theoreticalInterestPeriod";

import type {
  ActivityKind,
  HomeDashboardData,
  RecentActivityItem,
  UpcomingCollection,
} from "../types";

type LoanRow = {
  id: string;
  initial_amount: number | string;
  current_principal: number | string;
  interest_rate: number | string;
  currency: string | null;
  next_payment_date: string;
  status: string;
  clients:
    | { name: string; last_name: string | null }
    | { name: string; last_name: string | null }[]
    | null;
};

type TransactionRow = {
  id: string;
  transaction_type: string;
  amount: number | string;
  reason: string | null;
  currency: string | null;
  created_at: string;
};

function asNumber(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function clientName(
  clients: LoanRow["clients"],
): string {
  const client = Array.isArray(clients) ? clients[0] : clients;

  if (!client) {
    return "—";
  }

  return [client.name, client.last_name].filter(Boolean).join(" ").trim() || "—";
}

function mapTransactionKind(
  type: string,
): { kind: ActivityKind; signed: 1 | -1 } | null {
  switch (type) {
    case "interest_collection":
    case "principal_collection":
    case "capital_deposit":
    case "debt_received":
    case "vault_transfer_in":
      return { kind: "payment_received", signed: 1 };
    case "loan_disbursement":
      return { kind: "new_loan", signed: -1 };
    case "capital_withdrawal":
    case "debt_interest_payment":
    case "debt_principal_payment":
    case "vault_transfer_out":
      return { kind: "cash_out", signed: -1 };
    default:
      return null;
  }
}

/** Skip English canned reasons from DB triggers; keep useful free-text (notes, lender). */
function activityDetail(reason: string | null, transactionType: string): string {
  const trimmed = reason?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  const canned = new Set([
    "Loan disbursed to client",
    "Interest payment collection",
    "Principal amortization collection",
    "Debt interest payment",
    "Debt principal payment",
  ]);
  if (canned.has(trimmed)) {
    return "";
  }
  if (/^Transfer (to|from) [A-Z]{3}$/.test(trimmed)) {
    return "";
  }
  if (
    transactionType === "debt_received" &&
    trimmed.startsWith("Debt received from ")
  ) {
    return trimmed.slice("Debt received from ".length).trim();
  }

  return trimmed;
}

export async function getHomeDashboard(
  currencyParam: string | null,
): Promise<HomeDashboardData> {
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

  const [vaultResult, loansResult, upcomingResult, activityResult] =
    await Promise.all([
      supabase
        .from("vault_balances")
        .select("currency, balance")
        .eq("currency", currency)
        .maybeSingle(),
      supabase
        .from("loans")
        .select(
          "id, initial_amount, current_principal, interest_rate, currency, next_payment_date, status",
        )
        .in("status", ["active", "overdue"]),
      supabase
        .from("loans")
        .select(
          "id, initial_amount, current_principal, interest_rate, currency, next_payment_date, status, clients(name, last_name)",
        )
        .in("status", ["active", "overdue"])
        .eq("currency", currency)
        .order("next_payment_date", { ascending: true })
        .limit(8),
      supabase
        .from("transactions")
        .select("id, transaction_type, amount, reason, currency, created_at")
        .eq("currency", currency)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  if (vaultResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", vaultResult.error.message);
  }

  if (loansResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", loansResult.error.message);
  }

  if (upcomingResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", upcomingResult.error.message);
  }

  if (activityResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", activityResult.error.message);
  }

  const loansInCurrency = ((loansResult.data ?? []) as LoanRow[]).filter(
    (loan) => (loan.currency ?? "USD") === currency,
  );

  const totalLent = loansInCurrency.reduce(
    (sum, loan) => sum + asNumber(loan.current_principal),
    0,
  );

  const projectedInterest = loansInCurrency.reduce(
    (sum, loan) =>
      sum +
      theoreticalInterestOnePeriod(
        asNumber(loan.initial_amount),
        asNumber(loan.interest_rate),
      ),
    0,
  );

  const overdueAlerts = loansInCurrency.filter(
    (loan) => loan.status === "overdue",
  ).length;

  const upcomingCollections: UpcomingCollection[] = (
    (upcomingResult.data ?? []) as LoanRow[]
  ).map((loan) => ({
    id: loan.id,
    clientName: clientName(loan.clients),
    dueDate: loan.next_payment_date,
    amount: theoreticalInterestOnePeriod(
      asNumber(loan.initial_amount),
      asNumber(loan.interest_rate),
    ),
    status: loan.status === "overdue" ? "overdue" : "active",
  }));

  const recentActivity: RecentActivityItem[] = [];

  for (const row of (activityResult.data ?? []) as TransactionRow[]) {
    const mapped = mapTransactionKind(row.transaction_type);

    if (!mapped) {
      continue;
    }

    const amount = asNumber(row.amount);

    recentActivity.push({
      id: row.id,
      kind: mapped.kind,
      detail: activityDetail(row.reason, row.transaction_type),
      amount,
      signedAmount: mapped.signed * amount,
    });
  }

  return {
    metrics: {
      capitalInCash: asNumber(vaultResult.data?.balance),
      totalLent,
      projectedInterest,
      overdueAlerts,
    },
    upcomingCollections,
    recentActivity,
  };
}
