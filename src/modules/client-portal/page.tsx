"use client";

import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

import { usePortalLoan } from "./hooks/usePortalLoan";
import type { PortalLoan } from "./types";

function statusLabelKey(status: PortalLoan["status"]) {
  switch (status) {
    case "overdue":
      return "portal.statusOverdue";
    case "paid":
      return "portal.statusPaid";
    default:
      return "portal.statusActive";
  }
}

function statusBadgeClass(status: PortalLoan["status"]) {
  switch (status) {
    case "overdue":
      return "bg-danger/15 text-danger";
    case "paid":
      return "bg-surface-muted text-text-secondary";
    default:
      return "bg-success/15 text-success";
  }
}

export function ClientPortalLoanPage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ token: string; loanId: string }>();
  const token = typeof params?.token === "string" ? params.token : undefined;
  const loanId = typeof params?.loanId === "string" ? params.loanId : undefined;
  const { data, isLoading, isError, error, refetch } = usePortalLoan(token, loanId);

  const totals = useMemo(() => {
    if (!data) {
      return { interest: 0, amortization: 0, total: 0 };
    }
    return data.payments.reduce(
      (acc, payment) => ({
        interest: acc.interest + payment.interestAmount,
        amortization: acc.amortization + payment.amortizationAmount,
        total: acc.total + payment.totalAmount,
      }),
      { interest: 0, amortization: 0, total: 0 },
    );
  }, [data]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-surface-muted" />
        <div className="h-28 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-surface-muted" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10">
        <ErrorState
          title={t("portal.title")}
          description={
            error instanceof Error ? error.message : t("portal.notFound")
          }
          onRetry={() => {
            void refetch();
          }}
        />
      </main>
    );
  }

  const { loan, payments, clientName } = data;
  const isOverdue = loan.status === "overdue";
  const StatusIcon =
    loan.status === "overdue"
      ? AlertTriangle
      : loan.status === "paid"
        ? CheckCircle2
        : Calendar;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--color-primary-container)_0%,_transparent_55%),linear-gradient(180deg,var(--color-background),var(--color-surface-muted))]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
        <header className="space-y-2">
          <p className="font-headline text-sm font-semibold tracking-wide text-primary">
            Giro Kaja
          </p>
          <h1 className="font-headline text-2xl font-semibold text-text-main md:text-3xl">
            {t("portal.title")}
          </h1>
          <p className="text-sm text-text-secondary">{t("portal.subtitle")}</p>
        </header>

        <section className="rounded-xl border border-border bg-surface/95 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-headline text-xl font-semibold text-text-main">
              {clientName}
            </h2>
            <span
              className={cn(
                "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
                statusBadgeClass(loan.status),
              )}
            >
              {t(statusLabelKey(loan.status))}
            </span>
            <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
              {loan.currency}
            </span>
          </div>

          {loan.description ? (
            <p className="mt-3 text-sm text-text-secondary">{loan.description}</p>
          ) : null}

          {isOverdue && loan.daysOverdue > 0 ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-danger">
              <AlertTriangle className="size-4" aria-hidden />
              {t("portal.daysOverdue", { count: loan.daysOverdue })}
            </p>
          ) : null}
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-text-secondary">{t("portal.initialAmount")}</p>
            <p className="mt-1 font-headline text-xl font-semibold text-text-main">
              {formatMoney(loan.initialAmount, loan.currency)}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-text-secondary">
              {t("portal.currentPrincipal")}
            </p>
            <p className="mt-1 font-headline text-xl font-semibold text-text-main">
              {formatMoney(loan.currentPrincipal, loan.currency)}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-text-secondary">{t("portal.interestRate")}</p>
            <p className="mt-1 font-headline text-xl font-semibold text-text-main">
              {loan.interestRate}%{" "}
              <span className="text-sm font-normal text-text-secondary">
                {t("portal.monthly")}
              </span>
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-text-secondary">{t("portal.nextPayment")}</p>
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-2 font-headline text-xl font-semibold",
                isOverdue ? "text-danger" : "text-primary",
              )}
            >
              <StatusIcon className="size-5" aria-hidden />
              {formatShortDate(loan.nextPaymentDate, i18n.language)}
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-border bg-surface p-4">
          <h3 className="font-headline text-base font-semibold text-text-main">
            {t("portal.timeline")}
          </h3>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-secondary">{t("portal.issueDate")}</dt>
              <dd className="mt-0.5 font-medium text-text-main">
                {formatShortDate(loan.issueDate, i18n.language)}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">{t("portal.nextPayment")}</dt>
              <dd className="mt-0.5 font-medium text-text-main">
                {formatShortDate(loan.nextPaymentDate, i18n.language)}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">{t("portal.totalPaid")}</dt>
              <dd className="mt-0.5 font-medium text-text-main">
                {formatMoney(totals.total, loan.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">{t("portal.totalInterestPaid")}</dt>
              <dd className="mt-0.5 font-medium text-text-main">
                {formatMoney(totals.interest, loan.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">
                {t("portal.totalAmortizationPaid")}
              </dt>
              <dd className="mt-0.5 font-medium text-text-main">
                {formatMoney(totals.amortization, loan.currency)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-headline text-base font-semibold text-text-main">
              {t("portal.paymentHistory")}
            </h3>
          </div>

          {payments.length === 0 ? (
            <p className="p-5 text-center text-sm text-text-secondary">
              {t("portal.noPaymentsYet")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted text-xs text-text-secondary">
                    <th className="px-4 py-3 font-medium">{t("portal.paymentDate")}</th>
                    <th className="px-4 py-3 text-right font-medium">
                      {t("portal.interest")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      {t("portal.amortization")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      {t("portal.total")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 text-text-main">
                        {formatShortDate(payment.paymentDate, i18n.language)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {formatMoney(payment.interestAmount, loan.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {formatMoney(payment.amortizationAmount, loan.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text-main">
                        {formatMoney(payment.totalAmount, loan.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="pb-6 text-center text-xs text-text-secondary">
          {t("portal.footerNote")}
        </p>
      </div>
    </main>
  );
}
