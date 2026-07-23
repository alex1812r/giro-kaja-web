import type { DebtsOverview } from "../types";

export const mockDebtsOverview: DebtsOverview = {
  metrics: {
    totalOwed: 42_800,
    projectionNextMonth: 6_400,
    interestCost: 2_150,
    activeCount: 5,
    overdueCount: 1,
  },
  upcomingDebts: [
    {
      id: "d1",
      lender: "Banco Regional",
      nextPaymentDate: "2023-10-18",
      interestRate: 3.5,
      currentPrincipal: 8_000,
      status: "active",
      currency: "USD",
    },
    {
      id: "d2",
      lender: "María Familia",
      nextPaymentDate: "2023-10-12",
      interestRate: 5,
      currentPrincipal: 1_500,
      status: "overdue",
      currency: "USD",
    },
    {
      id: "d3",
      lender: "Cooperativa Norte",
      nextPaymentDate: "2023-10-05",
      interestRate: 4,
      currentPrincipal: 0,
      status: "paid",
      currency: "USD",
    },
  ],
};
