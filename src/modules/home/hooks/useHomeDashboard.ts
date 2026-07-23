"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrency } from "@/shared/currency";

import { fetchHomeDashboard } from "../services/fetchHomeDashboard";

export const homeQueryKeys = {
  all: ["home"] as const,
  dashboard: (currency: string) =>
    [...homeQueryKeys.all, "dashboard", currency] as const,
};

export function useHomeDashboard() {
  const { currency } = useCurrency();

  return useQuery({
    queryKey: homeQueryKeys.dashboard(currency),
    queryFn: () => fetchHomeDashboard(currency),
  });
}
