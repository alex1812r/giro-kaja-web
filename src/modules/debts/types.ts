export type DebtStatus = "active" | "overdue" | "paid";

export type DebtsSummaryMetrics = {
  totalOwed: number;
  projectionNextMonth: number;
  interestCost: number;
  activeCount: number;
  overdueCount: number;
};

export type DebtListItem = {
  id: string;
  lender: string;
  nextPaymentDate: string;
  interestRate: number;
  currentPrincipal: number;
  status: DebtStatus;
  currency: string;
};

export type DebtsOverview = {
  metrics: DebtsSummaryMetrics;
  upcomingDebts: DebtListItem[];
};

export type DebtsListParams = {
  currency?: string;
  lender?: string;
  nextPaymentDateFrom: string;
  nextPaymentDateTo: string;
  page?: number;
  pageSize?: number;
};

export type DebtsListPage = {
  items: DebtListItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type DebtDetail = {
  id: string;
  lender: string;
  status: DebtStatus;
  currency: string;
  currentPrincipal: number;
  initialAmount: number;
  interestRate: number;
  nextPaymentDate: string;
  description: string | null;
};

export type DebtPayment = {
  id: string;
  paymentDate: string;
  interestAmount: number;
  amortizationAmount: number;
  totalAmount: number;
  status: "paid" | "pending";
  description: string | null;
};

export type DebtDetailResponse = {
  debt: DebtDetail;
  payments: DebtPayment[];
};
