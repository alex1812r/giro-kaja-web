import type { LoansOverview } from "../types";

export const mockLoansOverview: LoansOverview = {
  metrics: {
    totalLent: 128_400,
    projectionNextMonth: 15_200,
    interestGain: 8_450,
    activeCount: 12,
    overdueCount: 3,
  },
  upcomingLoans: [
    {
      id: "l1",
      clientName: "Juan Pérez",
      nextPaymentDate: "2023-10-15",
      interestRate: 5,
      currentPrincipal: 2_500,
      status: "active",
      currency: "USD",
    },
    {
      id: "l2",
      clientName: "María García",
      nextPaymentDate: "2023-10-10",
      interestRate: 8,
      currentPrincipal: 4_100,
      status: "overdue",
      currency: "USD",
    },
    {
      id: "l3",
      clientName: "Carlos Ruiz",
      nextPaymentDate: "2023-10-01",
      interestRate: 4.5,
      currentPrincipal: 1_200,
      status: "paid",
      currency: "USD",
    },
  ],
};
