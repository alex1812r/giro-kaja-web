import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

import type { CashRegisterSummary } from "../types";

export function fetchCashRegisterSummary(currency: CurrencyCode) {
  return apiFetch<CashRegisterSummary>("/api/cash-register", {
    query: { currency },
  });
}
