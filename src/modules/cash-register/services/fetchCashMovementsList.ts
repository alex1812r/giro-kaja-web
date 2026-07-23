import { apiFetch } from "@/shared/api/apiFetch";

import type { CashMovementsListPage, CashMovementsListParams } from "../types";

export function fetchCashMovementsList(params: CashMovementsListParams) {
  return apiFetch<CashMovementsListPage>("/api/cash-register/movements", {
    query: {
      startDate: params.startDate,
      endDate: params.endDate,
      currency: params.currency,
      type: params.type,
      search: params.search,
      page: params.page ?? 0,
      pageSize: params.pageSize ?? 30,
    },
  });
}
