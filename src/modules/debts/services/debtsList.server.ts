import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

import type {
  DebtListItem,
  DebtStatus,
  DebtsListPage,
  DebtsListParams,
} from "../types";

const DEFAULT_PAGE_SIZE = 10;

type DebtRow = {
  id: string;
  lender: string;
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
  return Math.min(Math.floor(value), 50);
}

export async function getDebtsList(
  params: DebtsListParams,
): Promise<DebtsListPage> {
  const currency: CurrencyCode = isCurrencyCode(params.currency ?? "")
    ? (params.currency as CurrencyCode)
    : "USD";
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  let query = supabase
    .from("debts")
    .select(
      "id, lender, current_principal, interest_rate, currency, next_payment_date, status",
    )
    .eq("currency", currency)
    .gte("next_payment_date", params.nextPaymentDateFrom)
    .lte("next_payment_date", params.nextPaymentDateTo)
    .order("next_payment_date", { ascending: true })
    .range(from, to);

  const lender = params.lender?.trim();
  if (lender) {
    query = query.ilike("lender", `%${lender}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const items: DebtListItem[] = ((data ?? []) as DebtRow[]).map((debt) => ({
    id: debt.id,
    lender: debt.lender?.trim() || "—",
    nextPaymentDate: debt.next_payment_date,
    interestRate: asNumber(debt.interest_rate),
    currentPrincipal: asNumber(debt.current_principal),
    status: asDebtStatus(debt.status),
    currency: debt.currency ?? currency,
  }));

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}
