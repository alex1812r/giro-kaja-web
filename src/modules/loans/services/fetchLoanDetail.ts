import { apiFetch } from "@/shared/api/apiFetch";

import type { LoanDetailResponse } from "../types";

export function fetchLoanDetail(loanId: string) {
  return apiFetch<LoanDetailResponse>(`/api/loans/${loanId}`);
}
