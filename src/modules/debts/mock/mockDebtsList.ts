import type { DebtsListPage } from "../types";
import { mockDebtsOverview } from "./mockDebtsOverview";

export const mockDebtsList: DebtsListPage = {
  items: mockDebtsOverview.upcomingDebts,
  page: 0,
  pageSize: 10,
  hasMore: false,
};
