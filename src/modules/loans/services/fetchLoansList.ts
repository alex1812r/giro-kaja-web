import { apiFetch } from "@/shared/api/apiFetch";

import type { LoansListPage, LoansListParams } from "../types";

export function fetchLoansList(params: LoansListParams) {
  return apiFetch<LoansListPage>("/api/loans/list", {
    query: {
      currency: params.currency,
      clientId: params.clientId,
      nextPaymentDateFrom: params.nextPaymentDateFrom,
      nextPaymentDateTo: params.nextPaymentDateTo,
      page: params.page ?? 0,
      pageSize: params.pageSize ?? 10,
    },
  });
}
