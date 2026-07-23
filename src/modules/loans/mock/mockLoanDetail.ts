import type { LoanDetailResponse } from "../types";

export const mockLoanDetail: LoanDetailResponse = {
  loan: {
    id: "l1",
    clientName: "Juan Pérez",
    status: "active",
    currency: "USD",
    currentPrincipal: 2_500,
    initialAmount: 5_000,
    interestRate: 5,
    nextPaymentDate: "2023-11-15",
    description: null,
  },
  payments: [
    {
      id: "p1",
      paymentDate: "2023-10-15",
      interestAmount: 125,
      amortizationAmount: 325,
      totalAmount: 450,
      status: "paid",
      description: null,
    },
    {
      id: "p2",
      paymentDate: "2023-09-15",
      interestAmount: 141.25,
      amortizationAmount: 308.75,
      totalAmount: 450,
      status: "paid",
      description: null,
    },
    {
      id: "p3",
      paymentDate: "2023-08-15",
      interestAmount: 156.69,
      amortizationAmount: 293.31,
      totalAmount: 450,
      status: "paid",
      description: null,
    },
    {
      id: "p4",
      paymentDate: "2023-07-15",
      interestAmount: 171.36,
      amortizationAmount: 278.64,
      totalAmount: 450,
      status: "paid",
      description: null,
    },
  ],
};
