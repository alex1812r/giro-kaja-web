"use client";

import {
  Calendar,
  Landmark,
  Pencil,
  PiggyBank,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

import type { LoanDetail } from "../../types";

type LoanDetailStatsProps = {
  loan: LoanDetail;
  canEditNextPayment?: boolean;
  onEditNextPayment?: () => void;
};

type Stat = {
  key: string;
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  valueClassName?: string;
  action?: ReactNode;
};

export function LoanDetailStats({
  loan,
  canEditNextPayment = false,
  onEditNextPayment,
}: LoanDetailStatsProps) {
  const { t, i18n } = useTranslation();

  const stats: Stat[] = [
    {
      key: "capital",
      label: t("loans.capitalCurrent"),
      value: formatMoney(loan.currentPrincipal, loan.currency),
      icon: Landmark,
    },
    {
      key: "initial",
      label: t("loans.initialAmount"),
      value: formatMoney(loan.initialAmount, loan.currency),
      icon: PiggyBank,
      valueClassName: "text-text-secondary",
    },
    {
      key: "rate",
      label: t("loans.rateShort"),
      value: (
        <>
          {loan.interestRate}%{" "}
          <span className="text-sm font-normal text-text-secondary">
            {t("loans.monthly")}
          </span>
        </>
      ),
      icon: TrendingUp,
    },
    {
      key: "nextPayment",
      label: t("loans.nextPaymentShort"),
      value: formatShortDate(loan.nextPaymentDate, i18n.language),
      icon: Calendar,
      valueClassName: "text-primary",
      action:
        canEditNextPayment && onEditNextPayment ? (
          <button
            type="button"
            onClick={onEditNextPayment}
            className="inline-flex size-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-muted hover:text-primary"
            aria-label={t("loans.editNextPaymentTitle")}
          >
            <Pencil className="size-4" aria-hidden />
          </button>
        ) : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.key}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-2 text-xs text-text-secondary">
                <Icon className="size-4 shrink-0" aria-hidden />
                {stat.label}
              </span>
              {stat.action}
            </div>
            <p
              className={cn(
                "font-headline text-xl font-semibold tracking-tight text-text-main",
                stat.valueClassName,
              )}
            >
              {stat.value}
            </p>
          </article>
        );
      })}
    </div>
  );
}
