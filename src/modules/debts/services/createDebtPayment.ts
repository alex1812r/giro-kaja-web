import { apiFetch } from "@/shared/api/apiFetch";

import type { DebtPayment } from "../types";

export type CreateDebtPaymentInput = {
  paymentDate: string;
  amountPaid: number;
  description?: string | null;
};

export function createDebtPayment(debtId: string, input: CreateDebtPaymentInput) {
  return apiFetch<DebtPayment>(`/api/debts/${debtId}/payments`, {
    method: "POST",
    body: input,
  });
}
