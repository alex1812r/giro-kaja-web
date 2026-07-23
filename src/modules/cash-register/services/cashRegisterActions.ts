import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

export function postDeposit(body: {
  amount: number;
  note?: string | null;
  currency: CurrencyCode;
}) {
  return apiFetch<{ ok: true }>("/api/cash-register/deposit", {
    method: "POST",
    body,
  });
}

export function postWithdraw(body: {
  amount: number;
  reason: string;
  currency: CurrencyCode;
}) {
  return apiFetch<{ ok: true }>("/api/cash-register/withdraw", {
    method: "POST",
    body,
  });
}

export function postTransfer(body: {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  amount: number;
}) {
  return apiFetch<{ ok: true }>("/api/cash-register/transfer", {
    method: "POST",
    body,
  });
}

export function fetchVaultBalances() {
  return apiFetch<{ balances: Record<CurrencyCode, number> }>(
    "/api/cash-register/balances",
  );
}
