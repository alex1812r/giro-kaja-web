import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

import type { DebtsOverview } from "../types";

export function fetchDebtsOverview(currency: CurrencyCode) {
  return apiFetch<DebtsOverview>("/api/debts", {
    query: { currency },
  });
}
