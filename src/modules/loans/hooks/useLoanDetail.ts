"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchLoanDetail } from "../services/fetchLoanDetail";
import { loansQueryKeys } from "./useLoansOverview";

export function useLoanDetail(loanId: string | undefined) {
  return useQuery({
    queryKey: [...loansQueryKeys.all, "detail", loanId ?? ""] as const,
    queryFn: () => fetchLoanDetail(loanId!),
    enabled: Boolean(loanId),
  });
}
