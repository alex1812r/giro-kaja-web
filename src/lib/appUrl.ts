/** Public web origin for shareable links (no trailing slash). */
export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!raw) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL.");
  }

  return raw.replace(/\/+$/, "");
}

export function buildClientPortalLoanUrl(token: string, loanId: string): string {
  return `${getAppBaseUrl()}/p/${encodeURIComponent(token)}/${encodeURIComponent(loanId)}`;
}
