import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

import type { CashMovement, CashMovementsListPage, CashMovementsListParams } from "../types";
import { isInflowTransaction, transactionTypeKey } from "./transactionTypeMap";

const DEFAULT_PAGE_SIZE = 30;

const VALID_TYPES = new Set([
  "capital_deposit",
  "capital_withdrawal",
  "loan_disbursement",
  "interest_collection",
  "principal_collection",
  "debt_received",
  "debt_interest_payment",
  "debt_principal_payment",
  "vault_transfer_out",
  "vault_transfer_in",
]);

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

function parsePage(value: number | undefined): number {
  if (value == null || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

function parsePageSize(value: number | undefined): number {
  if (value == null || !Number.isFinite(value) || value < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(value), 100);
}

export async function listCashMovements(
  params: CashMovementsListParams,
): Promise<CashMovementsListPage> {
  const currency: CurrencyCode = isCurrencyCode(params.currency ?? "")
    ? (params.currency as CurrencyCode)
    : "USD";

  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);
  const startDay = params.startDate.slice(0, 10);
  const endDay = params.endDate.slice(0, 10);
  const startAt = `${startDay}T00:00:00.000Z`;
  const endAt = `${endDay}T23:59:59.999Z`;

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  let query = supabase
    .from("transactions")
    .select("id, transaction_type, amount, reason, currency, created_at")
    .eq("currency", currency)
    .gte("created_at", startAt)
    .lte("created_at", endAt)
    .order("created_at", { ascending: false });

  if (params.type && VALID_TYPES.has(params.type)) {
    query = query.eq("transaction_type", params.type);
  }

  const search = params.search?.trim();
  if (search) {
    query = query.ilike("reason", `%${search}%`);
  }

  const from = page * pageSize;
  const to = from + pageSize;

  const { data, error } = await query.range(from, to);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const rows = (data ?? []) as TxRow[];
  const hasMore = rows.length > pageSize;
  const pageRows = hasMore ? rows.slice(0, pageSize) : rows;

  const items: CashMovement[] = pageRows.map((row) => ({
    id: row.id,
    transactionType: row.transaction_type,
    typeKey: transactionTypeKey(row.transaction_type),
    date: row.created_at,
    amount: asNumber(row.amount),
    isInflow: isInflowTransaction(row.transaction_type),
    reason: row.reason,
    currency: row.currency ?? currency,
  }));

  return { items, page, pageSize, hasMore };
}
