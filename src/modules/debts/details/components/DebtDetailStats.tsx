"use client";

import {
  Calendar,
  Landmark,
  PiggyBank,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

import type { DebtDetail } from "../../types";

type DebtDetailStatsProps = {
  debt: DebtDetail;
};

type Stat = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  valueClassName?: string;
};

export function DebtDetailStats({ debt }: DebtDetailStatsProps) {
  const { t, i18n } = useTranslation();

  const stats: Stat[] = [
    {
      label: t("debts.currentPrincipalOwed"),
      value: formatMoney(debt.currentPrincipal, debt.currency),
      icon: Landmark,
    },
    {
      label: t("debts.initialAmount"),
      value: formatMoney(debt.initialAmount, debt.currency),
      icon: PiggyBank,
      valueClassName: "text-text-secondary",
    },
    {
      label: t("debts.rateShort"),
      value: (
        <>
          {debt.interestRate}%{" "}
          <span className="text-sm font-normal text-text-secondary">
            {t("debts.monthly")}
          </span>
        </>
      ),
      icon: TrendingUp,
    },
    {
      label: t("debts.nextPaymentShort"),
      value: formatShortDate(debt.nextPaymentDate, i18n.language),
      icon: Calendar,
      valueClassName: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
          >
            <span className="flex items-center gap-2 text-xs text-text-secondary">
              <Icon className="size-4 shrink-0" aria-hidden />
              {stat.label}
            </span>
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
