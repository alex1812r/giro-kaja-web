import type { HomeDashboardData } from "../types";

/** Placeholder aligned with Stitch “Dashboard Inicio” until domain APIs exist. */
export const mockHomeDashboard: HomeDashboardData = {
  metrics: {
    capitalInCash: 45_280.5,
    totalLent: 128_400,
    projectedInterest: 12_350,
    overdueAlerts: 3,
  },
  upcomingCollections: [
    {
      id: "c1",
      clientName: "Juan Pérez",
      dueDate: "2023-10-15",
      amount: 450,
      status: "active",
    },
    {
      id: "c2",
      clientName: "María García",
      dueDate: "2023-10-12",
      amount: 320,
      status: "overdue",
    },
    {
      id: "c3",
      clientName: "Carlos Ruiz",
      dueDate: "2023-10-18",
      amount: 1_200,
      status: "active",
    },
  ],
  recentActivity: [
    {
      id: "a1",
      kind: "payment_received",
      detail: "1024",
      amount: 450,
      signedAmount: 450,
    },
    {
      id: "a2",
      kind: "new_loan",
      detail: "Ana Torres",
      amount: 5_000,
      signedAmount: -5_000,
    },
    {
      id: "a3",
      kind: "cash_out",
      detail: "Gastos oficina",
      amount: 120,
      signedAmount: -120,
    },
  ],
};
