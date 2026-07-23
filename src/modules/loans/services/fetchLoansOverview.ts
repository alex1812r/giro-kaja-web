import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

import type { LoansOverview } from "../types";

export function fetchLoansOverview(currency: CurrencyCode) {
  return apiFetch<LoansOverview>("/api/loans", {
    query: { currency },
  });
}
