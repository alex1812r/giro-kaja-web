"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDebtDetail } from "../services/fetchDebtDetail";
import { debtsQueryKeys } from "./useDebtsOverview";

export function useDebtDetail(debtId: string | undefined) {
  return useQuery({
    queryKey: [...debtsQueryKeys.all, "detail", debtId ?? ""] as const,
    queryFn: () => fetchDebtDetail(debtId!),
    enabled: Boolean(debtId),
  });
}
