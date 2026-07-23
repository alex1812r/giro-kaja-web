"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchLoanPortalLink,
  generateLoanPortalLink,
  regenerateLoanPortalLink,
  revokeLoanPortalLink,
} from "../services/fetchLoanPortalLink";
import { loansQueryKeys } from "./useLoansOverview";

export function loanPortalLinkQueryKey(loanId: string) {
  return [...loansQueryKeys.all, "portal-link", loanId] as const;
}

export function useLoanPortalLink(loanId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: loanPortalLinkQueryKey(loanId ?? ""),
    queryFn: () => fetchLoanPortalLink(loanId!),
    enabled: Boolean(loanId) && enabled,
  });
}

export function useGenerateLoanPortalLink(loanId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateLoanPortalLink(loanId!),
    onSuccess: (data) => {
      if (!loanId) {
        return;
      }
      queryClient.setQueryData(loanPortalLinkQueryKey(loanId), data);
    },
  });
}

export function useRegenerateLoanPortalLink(loanId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => regenerateLoanPortalLink(loanId!),
    onSuccess: (data) => {
      if (!loanId) {
        return;
      }
      queryClient.setQueryData(loanPortalLinkQueryKey(loanId), data);
    },
  });
}

export function useRevokeLoanPortalLink(loanId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => revokeLoanPortalLink(loanId!),
    onSuccess: () => {
      if (!loanId) {
        return;
      }
      queryClient.setQueryData(loanPortalLinkQueryKey(loanId), null);
    },
  });
}
