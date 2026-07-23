import type { CashRegisterSummary } from "../types";

export const mockCashRegisterSummary: CashRegisterSummary = {
  balance: 45_280.5,
  debtDue: 0,
  recentMovements: [
    {
      id: "m1",
      transactionType: "interest_collection",
      typeKey: "cashRegister.interestCollection",
      date: "2023-10-14T12:00:00.000Z",
      amount: 450,
      isInflow: true,
      reason: "Pago de préstamo #1024",
      currency: "USD",
    },
    {
      id: "m2",
      transactionType: "capital_withdrawal",
      typeKey: "cashRegister.withdrawal",
      date: "2023-10-13T12:00:00.000Z",
      amount: 120,
      isInflow: false,
      reason: "Gastos de oficina",
      currency: "USD",
    },
    {
      id: "m3",
      transactionType: "capital_deposit",
      typeKey: "cashRegister.capitalDeposit",
      date: "2023-10-12T12:00:00.000Z",
      amount: 1_200,
      isInflow: true,
      reason: "Depósito inicial cliente",
      currency: "USD",
    },
    {
      id: "m4",
      transactionType: "capital_withdrawal",
      typeKey: "cashRegister.withdrawal",
      date: "2023-10-10T12:00:00.000Z",
      amount: 300,
      isInflow: false,
      reason: "Retiro de efectivo",
      currency: "USD",
    },
  ],
};
