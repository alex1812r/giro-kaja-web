import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

import type { HomeDashboardData } from "../types";

export function fetchHomeDashboard(currency: CurrencyCode) {
  return apiFetch<HomeDashboardData>("/api/home", {
    query: { currency },
  });
}
