import { apiFetch } from "@/shared/api/apiFetch";

import type { PortalLoanResponse } from "../types";

export function fetchPortalLoan(token: string, loanId: string) {
  return apiFetch<PortalLoanResponse>(
    `/api/portal/${encodeURIComponent(token)}/loans/${encodeURIComponent(loanId)}`,
  );
}
