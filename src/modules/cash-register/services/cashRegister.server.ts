import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

import type { CashMovement, CashRegisterSummary } from "../types";
import { isInflowTransaction, transactionTypeKey } from "./transactionTypeMap";

const RECENT_LIMIT = 8;

type VaultRow = { currency: string; balance: number | string };
type DebtRow = { current_principal: number | string; currency: string | null };
type TxRow = {
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

export async function getCashRegisterSummary(
  currencyParam: string | null,
): Promise<CashRegisterSummary> {
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

  const [vaultResult, debtsResult, movementsResult] = await Promise.all([
    supabase
      .from("vault_balances")
      .select("currency, balance")
      .eq("currency", currency)
      .maybeSingle(),
    supabase
      .from("debts")
      .select("current_principal, currency")
      .in("status", ["active", "overdue"])
      .eq("currency", currency),
    supabase
      .from("transactions")
      .select("id, transaction_type, amount, reason, currency, created_at")
      .eq("currency", currency)
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
  ]);

  if (vaultResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", vaultResult.error.message);
  }

  if (debtsResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", debtsResult.error.message);
  }

  if (movementsResult.error) {
    throw new ApiError(500, "INTERNAL_ERROR", movementsResult.error.message);
  }

  const vault = vaultResult.data as VaultRow | null;
  const debtDue = ((debtsResult.data ?? []) as DebtRow[]).reduce(
    (sum, row) => sum + asNumber(row.current_principal),
    0,
  );

  const recentMovements: CashMovement[] = (
    (movementsResult.data ?? []) as TxRow[]
  ).map((row) => ({
    id: row.id,
    transactionType: row.transaction_type,
    typeKey: transactionTypeKey(row.transaction_type),
    date: row.created_at,
    amount: asNumber(row.amount),
    isInflow: isInflowTransaction(row.transaction_type),
    reason: row.reason,
    currency: row.currency ?? currency,
  }));

  return {
    balance: asNumber(vault?.balance),
    debtDue,
    recentMovements,
  };
}
