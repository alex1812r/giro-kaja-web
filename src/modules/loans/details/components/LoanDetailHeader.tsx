"use client";

import { Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button/Button";
import { cn } from "@/shared/utils/cn";

import type { LoanDetail, LoanStatus } from "../../types";

type LoanDetailHeaderProps = {
  loan: LoanDetail;
  canRegisterPayment: boolean;
  onRegisterPayment?: () => void;
};

function statusBadgeClass(status: LoanStatus): string {
  switch (status) {
    case "overdue":
      return "bg-danger/15 text-danger";
    case "paid":
      return "bg-surface-muted text-text-secondary";
    default:
      return "bg-success/15 text-success";
  }
}

function statusLabelKey(status: LoanStatus): string {
  switch (status) {
    case "overdue":
      return "loans.statusOverdue";
    case "paid":
      return "loans.statusPaid";
    default:
      return "loans.statusActive";
  }
}

export function LoanDetailHeader({
  loan,
  canRegisterPayment,
  onRegisterPayment,
}: LoanDetailHeaderProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <h1 className="font-headline text-2xl font-semibold text-text-main">
          {t("loans.loanDetails")}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-text-main">
            {loan.clientName}
          </span>
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
      </div>

      {canRegisterPayment ? (
        <Button type="button" size="sm" onClick={onRegisterPayment}>
          <Banknote className="size-4" aria-hidden />
          {t("loans.registerPayment")}
        </Button>
      ) : null}
    </section>
  );
}
