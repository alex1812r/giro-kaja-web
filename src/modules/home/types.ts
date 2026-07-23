export type CollectionStatus = "active" | "overdue";

export type UpcomingCollection = {
  id: string;
  clientName: string;
  dueDate: string; // ISO date
  amount: number;
  status: CollectionStatus;
};

export type ActivityKind = "payment_received" | "new_loan" | "cash_out";

export type RecentActivityItem = {
  id: string;
  kind: ActivityKind;
  /** Secondary line (loan ref, client name, note). */
  detail: string;
  amount: number;
  /** Positive inflow, negative outflow — drives sign color. */
  signedAmount: number;
};

export type HomeDashboardMetrics = {
  capitalInCash: number;
  totalLent: number;
  projectedInterest: number;
  overdueAlerts: number;
};

export type HomeDashboardData = {
  metrics: HomeDashboardMetrics;
  upcomingCollections: UpcomingCollection[];
  recentActivity: RecentActivityItem[];
};
