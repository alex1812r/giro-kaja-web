import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

import type { LoanListItem, LoanStatus, LoansListPage, LoansListParams } from "../types";

const DEFAULT_PAGE_SIZE = 10;

type LoanRow = {
  id: string;
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

export async function getLoansList(
  params: LoansListParams,
): Promise<LoansListPage> {
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
    .from("loans")
    .select(
      "id, current_principal, interest_rate, currency, next_payment_date, status, clients(name, last_name)",
    )
    .eq("currency", currency)
    .gte("next_payment_date", params.nextPaymentDateFrom)
    .lte("next_payment_date", params.nextPaymentDateTo)
    .order("next_payment_date", { ascending: true })
    .range(from, to);

  if (params.clientId) {
    query = query.eq("client_id", params.clientId);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const rows = (data ?? []) as LoanRow[];
  const items: LoanListItem[] = rows.map((loan) => ({
    id: loan.id,
    clientName: clientName(loan.clients),
    nextPaymentDate: loan.next_payment_date,
    interestRate: asNumber(loan.interest_rate),
    currentPrincipal: asNumber(loan.current_principal),
    status: asLoanStatus(loan.status),
    currency: loan.currency ?? currency,
  }));

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}
