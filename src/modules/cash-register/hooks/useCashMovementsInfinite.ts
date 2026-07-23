"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchCashMovementsList } from "../services/fetchCashMovementsList";
import type { CashMovementsListParams } from "../types";
import { cashRegisterQueryKeys } from "./useCashRegisterSummary";

const PAGE_SIZE = 30;

export type CashMovementsInfiniteFilters = Pick<
  CashMovementsListParams,
  "startDate" | "endDate" | "currency" | "type" | "search"
>;

export function useCashMovementsInfinite(filters: CashMovementsInfiniteFilters) {
  return useInfiniteQuery({
    queryKey: [
      ...cashRegisterQueryKeys.all,
      "movements",
      filters,
    ] as const,
    queryFn: ({ pageParam }) =>
      fetchCashMovementsList({
        ...filters,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
