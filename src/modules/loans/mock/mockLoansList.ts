import type { LoansListPage } from "../types";
import { mockLoansOverview } from "./mockLoansOverview";

export const mockLoansList: LoansListPage = {
  items: mockLoansOverview.upcomingLoans,
  page: 0,
  pageSize: 10,
  hasMore: false,
};
