"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrency } from "@/shared/currency";

import { fetchDebtsOverview } from "../services/fetchDebtsOverview";

export const debtsQueryKeys = {
  all: ["debts"] as const,
  overview: (currency: string) =>
    [...debtsQueryKeys.all, "overview", currency] as const,
  list: (filters: {
    currency: string;
    lender?: string;
    nextPaymentDateFrom: string;
    nextPaymentDateTo: string;
  }) => [...debtsQueryKeys.all, "list", filters] as const,
};

export function useDebtsOverview() {
  const { currency } = useCurrency();

  return useQuery({
    queryKey: debtsQueryKeys.overview(currency),
    queryFn: () => fetchDebtsOverview(currency),
  });
}
