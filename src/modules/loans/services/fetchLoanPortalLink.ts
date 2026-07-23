import { apiFetch } from "@/shared/api/apiFetch";

export type LoanPortalLink = {
  token: string;
  url: string;
  created: boolean;
};

export function fetchLoanPortalLink(loanId: string) {
  return apiFetch<LoanPortalLink | null>(`/api/loans/${loanId}/portal-link`);
}

export function generateLoanPortalLink(loanId: string) {
  return apiFetch<LoanPortalLink>(`/api/loans/${loanId}/portal-link`, {
    method: "POST",
    body: {},
  });
}

export function regenerateLoanPortalLink(loanId: string) {
  return apiFetch<LoanPortalLink>(`/api/loans/${loanId}/portal-link`, {
    method: "POST",
    body: { regenerate: true },
  });
}

export function revokeLoanPortalLink(loanId: string) {
  return apiFetch<null>(`/api/loans/${loanId}/portal-link`, {
    method: "DELETE",
  });
}
