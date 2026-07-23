"use client";

import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";
import { getInitials } from "@/shared/utils/getInitials";

import type { DebtListItem, DebtStatus } from "../types";

function statusBadgeClass(status: DebtStatus): string {
  switch (status) {
    case "overdue":
      return "bg-danger/15 text-danger";
    case "paid":
      return "bg-surface-muted text-text-secondary";
    default:
      return "bg-success/15 text-success";
  }
}

function statusLabelKey(status: DebtStatus): string {
  switch (status) {
    case "overdue":
      return "debts.statusOverdue";
    case "paid":
      return "debts.statusPaid";
    default:
      return "debts.statusActive";
  }
}

type DebtListRowProps = {
  item: DebtListItem;
};

export function DebtListRow({ item }: DebtListRowProps) {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const isOverdue = item.status === "overdue";
  const isPaid = item.status === "paid";
  const DateIcon = isOverdue ? AlertTriangle : isPaid ? CheckCircle2 : Calendar;

  return (
    <li>
      <Link
        href={`/debts/${item.id}`}
        className={cn(
          "flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-surface-muted md:flex-row md:items-center md:justify-between",
          isPaid && "opacity-75 hover:opacity-100",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-text-secondary"
            aria-hidden
          >
            {getInitials(item.lender)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-main">
              {item.lender}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isOverdue && "text-danger",
                )}
              >
                <DateIcon className="size-3.5" aria-hidden />
                {formatShortDate(item.nextPaymentDate, i18n.language)}
              </span>
              <span className="border-l border-border pl-3">
                {t("debts.rateLabel", { rate: item.interestRate })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span
            className={cn(
              "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
              statusBadgeClass(item.status),
            )}
          >
            {t(statusLabelKey(item.status))}
          </span>
          <span
            className={cn(
              "font-headline text-sm font-semibold",
              isPaid ? "text-text-secondary line-through" : "text-text-main",
            )}
          >
            {formatMoney(item.currentPrincipal, item.currency || currency)}
          </span>
        </div>
      </Link>
    </li>
  );
}
