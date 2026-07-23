"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrency } from "@/shared/currency";

import { fetchLoansOverview } from "../services/fetchLoansOverview";

export const loansQueryKeys = {
  all: ["loans"] as const,
  overview: (currency: string) =>
    [...loansQueryKeys.all, "overview", currency] as const,
  list: (filters: {
    currency: string;
    clientId?: string;
    nextPaymentDateFrom: string;
    nextPaymentDateTo: string;
  }) => [...loansQueryKeys.all, "list", filters] as const,
};

export function useLoansOverview() {
  const { currency } = useCurrency();

  return useQuery({
    queryKey: loansQueryKeys.overview(currency),
    queryFn: () => fetchLoansOverview(currency),
  });
}
