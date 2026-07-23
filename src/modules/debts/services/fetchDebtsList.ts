import { apiFetch } from "@/shared/api/apiFetch";

import type { DebtsListPage, DebtsListParams } from "../types";

export function fetchDebtsList(params: DebtsListParams) {
  return apiFetch<DebtsListPage>("/api/debts/list", {
    query: {
      currency: params.currency,
      lender: params.lender,
      nextPaymentDateFrom: params.nextPaymentDateFrom,
      nextPaymentDateTo: params.nextPaymentDateTo,
      page: params.page ?? 0,
      pageSize: params.pageSize ?? 10,
    },
  });
}
