"use client";

import {
  ArrowDown,
  ArrowUp,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import type { ActivityKind, RecentActivityItem } from "../types";

type RecentActivityProps = {
  items: RecentActivityItem[];
};

const kindIcon: Record<
  ActivityKind,
  { icon: LucideIcon; iconWrap: string }
> = {
  payment_received: {
    icon: ArrowDown,
    iconWrap: "bg-primary-container text-on-primary-container",
  },
  new_loan: {
    icon: ArrowUp,
    iconWrap: "bg-surface-muted text-text-secondary",
  },
  cash_out: {
    icon: ReceiptText,
    iconWrap: "bg-surface-muted text-text-secondary",
  },
};

const kindTitleKey: Record<ActivityKind, string> = {
  payment_received: "home.activityPaymentReceived",
  new_loan: "home.activityNewLoan",
  cash_out: "home.activityCashOut",
};

export function RecentActivity({ items }: RecentActivityProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();

  return (
    <section className="space-y-3">
      <h2 className="font-headline text-base font-semibold text-text-main">
        {t("home.recentActivity")}
      </h2>

      <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        {items.length === 0 ? (
          <p className="text-sm text-text-secondary">{t("home.emptyActivity")}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const { icon: Icon, iconWrap } = kindIcon[item.kind];
              const isInflow = item.signedAmount >= 0;
              const rawDetail = item.detail?.trim() ?? "";
              const detail =
                item.kind === "payment_received" && /^\d+$/.test(rawDetail)
                  ? t("home.activityLoanRef", { id: rawDetail })
                  : rawDetail;

              return (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                        iconWrap,
                      )}
                    >
                      <Icon className="size-3" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-main">
                        {t(kindTitleKey[item.kind])}
                      </p>
                      {detail ? (
                        <p className="text-xs text-text-secondary">{detail}</p>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-headline text-sm font-semibold",
                      isInflow ? "text-success" : "text-danger",
                    )}
                  >
                    {isInflow ? "+" : "−"}
                    {formatMoney(Math.abs(item.signedAmount), currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-border pt-3 text-center">
          <Link
            href="/cash-register"
            className="text-xs font-bold tracking-wider text-primary uppercase hover:text-primary-dark"
          >
            {t("home.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
