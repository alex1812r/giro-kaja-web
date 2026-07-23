"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrency } from "@/shared/currency";

import { fetchCashRegisterSummary } from "../services/fetchCashRegisterSummary";

export const cashRegisterQueryKeys = {
  all: ["cash-register"] as const,
  summary: (currency: string) =>
    [...cashRegisterQueryKeys.all, "summary", currency] as const,
};

export function useCashRegisterSummary() {
  const { currency } = useCurrency();

  return useQuery({
    queryKey: cashRegisterQueryKeys.summary(currency),
    queryFn: () => fetchCashRegisterSummary(currency),
  });
}
