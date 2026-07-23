import { apiFetch } from "@/shared/api/apiFetch";

import type { LoanPayment } from "../types";

export type CreatePaymentInput = {
  paymentDate: string;
  amountPaid: number;
  description?: string | null;
};

export function createLoanPayment(loanId: string, input: CreatePaymentInput) {
  return apiFetch<LoanPayment>(`/api/loans/${loanId}/payments`, {
    method: "POST",
    body: input,
  });
}
