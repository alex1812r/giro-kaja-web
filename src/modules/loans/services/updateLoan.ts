import { apiFetch } from "@/shared/api/apiFetch";

import type { LoanDetailResponse } from "../types";

export type UpdateLoanBody = {
  nextPaymentDate: string;
};

export function updateLoan(loanId: string, body: UpdateLoanBody) {
  return apiFetch<LoanDetailResponse>(`/api/loans/${loanId}`, {
    method: "PATCH",
    body,
  });
}
