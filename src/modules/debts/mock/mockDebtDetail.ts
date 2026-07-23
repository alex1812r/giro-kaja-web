import type { DebtDetailResponse } from "../types";

export const mockDebtDetail: DebtDetailResponse = {
  debt: {
    id: "d1",
    lender: "Banco Regional",
    status: "active",
    currency: "USD",
    currentPrincipal: 8_000,
    initialAmount: 10_000,
    interestRate: 3.5,
    nextPaymentDate: "2023-10-18",
    description: "Crédito personal a 12 meses",
  },
  payments: [
    {
      id: "dp1",
      paymentDate: "2023-09-18",
      interestAmount: 350,
      amortizationAmount: 650,
      totalAmount: 1_000,
      status: "paid",
      description: null,
    },
  ],
};
