import type { LoanStatus } from "@/modules/loans/types";

export type PortalLoanPayment = {
  id: string;
  paymentDate: string;
  interestAmount: number;
  amortizationAmount: number;
  totalAmount: number;
  status: string;
  description: string | null;
};

export type PortalLoan = {
  id: string;
  initialAmount: number;
  currentPrincipal: number;
  interestRate: number;
  currency: string;
  issueDate: string;
  nextPaymentDate: string;
  status: LoanStatus;
  description: string | null;
  daysOverdue: number;
};

export type PortalLoanResponse = {
  clientName: string;
  loan: PortalLoan;
  payments: PortalLoanPayment[];
};
