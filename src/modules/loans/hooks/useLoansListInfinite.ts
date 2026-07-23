"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchLoansList } from "../services/fetchLoansList";
import type { LoansListParams } from "../types";
import { loansQueryKeys } from "./useLoansOverview";

const PAGE_SIZE = 10;

export type LoansListInfiniteFilters = Pick<
  LoansListParams,
  "currency" | "clientId" | "nextPaymentDateFrom" | "nextPaymentDateTo"
> & {
  currency: string;
};

export function useLoansListInfinite(
  filters: LoansListInfiniteFilters,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: loansQueryKeys.list(filters),
    queryFn: ({ pageParam }) =>
      fetchLoansList({
        ...filters,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: options?.enabled ?? true,
  });
}
