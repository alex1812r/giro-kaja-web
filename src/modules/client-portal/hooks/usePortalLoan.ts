"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPortalLoan } from "../services/fetchPortalLoan";

export function usePortalLoan(token: string | undefined, loanId: string | undefined) {
  return useQuery({
    queryKey: ["client-portal", "loan", token ?? "", loanId ?? ""] as const,
    queryFn: () => fetchPortalLoan(token!, loanId!),
    enabled: Boolean(token && loanId),
    retry: false,
  });
}
