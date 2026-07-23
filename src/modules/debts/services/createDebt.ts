import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

import type { DebtListItem } from "../types";

export type CreateDebtInput = {
  lender: string;
  initialAmount: number;
  interestRate: number;
  currency: CurrencyCode;
  issueDate: string;
  nextPaymentDate: string;
  description?: string | null;
};

export function createDebt(input: CreateDebtInput) {
  return apiFetch<DebtListItem>("/api/debts", {
    method: "POST",
    body: input,
  });
}
