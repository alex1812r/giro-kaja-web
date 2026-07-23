export type CashMovement = {
  id: string;
  /** DB transaction_type */
  transactionType: string;
  /** i18n key under cashRegister.* when no reason */
  typeKey: string;
  date: string;
  amount: number;
  isInflow: boolean;
  reason: string | null;
  currency: string;
};

export type CashRegisterSummary = {
  balance: number;
  debtDue: number;
  recentMovements: CashMovement[];
};

export type CashMovementsListParams = {
  startDate: string;
  endDate: string;
  currency?: string;
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type CashMovementsListPage = {
  items: CashMovement[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};
