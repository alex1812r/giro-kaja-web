import { ApiError } from "@/lib/api/apiError";
import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

import type {
  PortalLoan,
  PortalLoanPayment,
  PortalLoanResponse,
} from "../types";

function asNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function asStatus(value: unknown): PortalLoan["status"] {
  if (value === "overdue" || value === "paid") {
    return value;
  }
  return "active";
}

function asDateString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.slice(0, 10);
}

export async function getPortalLoan(
  token: string,
  loanId: string,
): Promise<PortalLoanResponse> {
  const trimmedToken = token.trim();
  const trimmedLoanId = loanId.trim();

  if (!trimmedToken || !trimmedLoanId) {
    throw new ApiError(400, "BAD_REQUEST", "Enlace de portal inválido.");
  }

  const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("get_portal_loan", {
    p_token: trimmedToken,
    p_loan_id: trimmedLoanId,
  });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  if (!data || typeof data !== "object") {
    throw new ApiError(404, "NOT_FOUND", "Préstamo no encontrado o enlace inválido.");
  }

  const payload = data as {
    clientName?: unknown;
    loan?: Record<string, unknown> | null;
    payments?: unknown;
  };

  if (!payload.loan) {
    throw new ApiError(404, "NOT_FOUND", "Préstamo no encontrado o enlace inválido.");
  }

  const loanRow = payload.loan;
  const loan: PortalLoan = {
    id: String(loanRow.id ?? trimmedLoanId),
    initialAmount: asNumber(loanRow.initialAmount),
    currentPrincipal: asNumber(loanRow.currentPrincipal),
    interestRate: asNumber(loanRow.interestRate),
    currency: String(loanRow.currency ?? "USD"),
    issueDate: asDateString(loanRow.issueDate),
    nextPaymentDate: asDateString(loanRow.nextPaymentDate),
    status: asStatus(loanRow.status),
    description:
      typeof loanRow.description === "string" && loanRow.description.trim()
        ? loanRow.description.trim()
        : null,
    daysOverdue: asNumber(loanRow.daysOverdue),
  };

  const paymentsRaw = Array.isArray(payload.payments) ? payload.payments : [];
  const payments: PortalLoanPayment[] = paymentsRaw.map((row) => {
    const payment = row as Record<string, unknown>;
    return {
      id: String(payment.id ?? ""),
      paymentDate: asDateString(payment.paymentDate),
      interestAmount: asNumber(payment.interestAmount),
      amortizationAmount: asNumber(payment.amortizationAmount),
      totalAmount: asNumber(payment.totalAmount),
      status: String(payment.status ?? "paid"),
      description:
        typeof payment.description === "string" && payment.description.trim()
          ? payment.description.trim()
          : null,
    };
  });

  return {
    clientName:
      typeof payload.clientName === "string" && payload.clientName.trim()
        ? payload.clientName.trim()
        : "—",
    loan,
    payments,
  };
}
