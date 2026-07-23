export type LoanStatus = "active" | "overdue" | "paid";

export type LoansSummaryMetrics = {
  totalLent: number;
  projectionNextMonth: number;
  interestGain: number;
  activeCount: number;
  overdueCount: number;
};

export type LoanListItem = {
  id: string;
  clientName: string;
  nextPaymentDate: string;
  interestRate: number;
  currentPrincipal: number;
  status: LoanStatus;
  currency: string;
};

export type LoansOverview = {
  metrics: LoansSummaryMetrics;
  upcomingLoans: LoanListItem[];
};

export type LoansListParams = {
  clientId?: string;
  nextPaymentDateFrom: string;
  nextPaymentDateTo: string;
  page?: number;
  pageSize?: number;
};

export type LoansListPage = {
  items: LoanListItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type LoanDetail = {
  id: string;
  clientName: string;
  status: LoanStatus;
  currency: string;
  currentPrincipal: number;
  initialAmount: number;
  interestRate: number;
  nextPaymentDate: string;
  description: string | null;
};

export type LoanPayment = {
  id: string;
  paymentDate: string;
  interestAmount: number;
  amortizationAmount: number;
  totalAmount: number;
  status: "paid" | "pending";
  description: string | null;
};

export type LoanDetailResponse = {
  loan: LoanDetail;
  payments: LoanPayment[];
};
