import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

import type { LoanListItem } from "../types";

export type CreateLoanInput = {
  clientId: string;
  initialAmount: number;
  interestRate: number;
  currency: CurrencyCode;
  issueDate: string;
  nextPaymentDate: string;
  description?: string | null;
};

export function createLoan(input: CreateLoanInput) {
  return apiFetch<LoanListItem>("/api/loans", {
    method: "POST",
    body: input,
  });
}
