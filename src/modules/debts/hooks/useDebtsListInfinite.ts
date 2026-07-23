"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchDebtsList } from "../services/fetchDebtsList";
import type { DebtsListParams } from "../types";
import { debtsQueryKeys } from "./useDebtsOverview";

const PAGE_SIZE = 10;

export type DebtsListInfiniteFilters = Pick<
  DebtsListParams,
  "lender" | "nextPaymentDateFrom" | "nextPaymentDateTo"
>;

export function useDebtsListInfinite(filters: DebtsListInfiniteFilters) {
  return useInfiniteQuery({
    queryKey: debtsQueryKeys.list(filters),
    queryFn: ({ pageParam }) =>
      fetchDebtsList({
        ...filters,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
