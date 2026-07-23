"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLoan, type UpdateLoanBody } from "../services/updateLoan";
import { loansQueryKeys } from "./useLoansOverview";

export function useUpdateLoan(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateLoanBody) => updateLoan(loanId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...loansQueryKeys.all, "detail", loanId],
        }),
        queryClient.invalidateQueries({ queryKey: loansQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
    },
  });
}
