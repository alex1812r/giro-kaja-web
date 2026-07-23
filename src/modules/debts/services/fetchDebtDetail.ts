import { apiFetch } from "@/shared/api/apiFetch";

import type { DebtDetailResponse } from "../types";

export function fetchDebtDetail(debtId: string) {
  return apiFetch<DebtDetailResponse>(`/api/debts/${debtId}`);
}
