import { http, HttpResponse } from "msw";

import { mockCashRegisterSummary } from "../src/modules/cash-register/mock/mockCashRegisterSummary";
import { mockClients } from "../src/modules/clients/mock/mockClients";
import { mockDebtDetail } from "../src/modules/debts/mock/mockDebtDetail";
import { mockDebtsList } from "../src/modules/debts/mock/mockDebtsList";
import { mockDebtsOverview } from "../src/modules/debts/mock/mockDebtsOverview";
import { mockHomeDashboard } from "../src/modules/home/mock/mockHomeDashboard";
import { mockLoanDetail } from "../src/modules/loans/mock/mockLoanDetail";
import { mockLoansList } from "../src/modules/loans/mock/mockLoansList";
import { mockLoansOverview } from "../src/modules/loans/mock/mockLoansOverview";

/**
 * Handlers MSW compartidos por Storybook.
 */
export const mswHandlers = [
  http.get("/api/home", () => {
    return HttpResponse.json({ data: mockHomeDashboard });
  }),
  http.get("/api/cash-register", () => {
    return HttpResponse.json({ data: mockCashRegisterSummary });
  }),
  http.get("/api/clients", () => {
    return HttpResponse.json({ data: mockClients });
  }),
  http.get("/api/debts/list", () => {
    return HttpResponse.json({ data: mockDebtsList });
  }),
  http.post("/api/debts/:id/payments", async ({ request, params }) => {
    const body = (await request.json()) as {
      paymentDate?: string;
      amountPaid?: number;
      description?: string | null;
    };
    const amount = Number(body.amountPaid ?? 0);
    const interest = 280;
    const amortization = Math.max(0, amount - interest);

    return HttpResponse.json(
      {
        data: {
          id: `dpay-${String(params.id)}-${Date.now()}`,
          paymentDate: body.paymentDate ?? new Date().toISOString().slice(0, 10),
          interestAmount: interest,
          amortizationAmount: amortization,
          totalAmount: amount,
          status: "paid",
          description: body.description ?? null,
        },
      },
      { status: 201 },
    );
  }),
  http.post("/api/debts", async ({ request }) => {
    const body = (await request.json()) as {
      lender?: string;
      initialAmount?: number;
      interestRate?: number;
      currency?: string;
      nextPaymentDate?: string;
    };

    return HttpResponse.json(
      {
        data: {
          id: `d-new-${Date.now()}`,
          lender: body.lender ?? "Acreedor",
          nextPaymentDate:
            body.nextPaymentDate ?? new Date().toISOString().slice(0, 10),
          interestRate: Number(body.interestRate ?? 0),
          currentPrincipal: Number(body.initialAmount ?? 0),
          status: "active",
          currency: body.currency ?? "USD",
        },
      },
      { status: 201 },
    );
  }),
  http.get("/api/debts/:id", ({ params }) => {
    return HttpResponse.json({
      data: {
        ...mockDebtDetail,
        debt: { ...mockDebtDetail.debt, id: String(params.id) },
      },
    });
  }),
  http.get("/api/debts", () => {
    return HttpResponse.json({ data: mockDebtsOverview });
  }),
  http.get("/api/loans/list", () => {
    return HttpResponse.json({ data: mockLoansList });
  }),
  http.post("/api/loans/:id/payments", async ({ request, params }) => {
    const body = (await request.json()) as {
      paymentDate?: string;
      amountPaid?: number;
      description?: string | null;
    };
    const amount = Number(body.amountPaid ?? 0);
    const interest = 125;
    const amortization = Math.max(0, amount - interest);

    return HttpResponse.json(
      {
        data: {
          id: `pay-${String(params.id)}-${Date.now()}`,
          paymentDate: body.paymentDate ?? new Date().toISOString().slice(0, 10),
          interestAmount: interest,
          amortizationAmount: amortization,
          totalAmount: amount,
          status: "paid",
          description: body.description ?? null,
        },
      },
      { status: 201 },
    );
  }),
  http.get("/api/loans/:id", ({ params }) => {
    return HttpResponse.json({
      data: {
        ...mockLoanDetail,
        loan: { ...mockLoanDetail.loan, id: String(params.id) },
      },
    });
  }),
  http.get("/api/loans", () => {
    return HttpResponse.json({ data: mockLoansOverview });
  }),
];
