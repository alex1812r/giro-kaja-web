"use client";

import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

import { cashMovementLabel } from "../services/transactionTypeMap";
import type { CashMovement } from "../types";

type RecentMovementsProps = {
  items: CashMovement[];
};

export function RecentMovements({ items }: RecentMovementsProps) {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-headline text-base font-semibold text-text-main">
          {t("cashRegister.recentMovements")}
        </h2>
        <Link
          href="/cash-register/movements"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark"
        >
          {t("cashRegister.viewMovements")}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {items.length === 0 ? (
          <div className="space-y-1 p-5 text-center">
            <p className="text-sm font-medium text-text-main">
              {t("cashRegister.noMovementsYet")}
            </p>
            <p className="text-xs text-text-secondary">
              {t("cashRegister.noMovementsYetSubtitle")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const title = cashMovementLabel(item, t);

              return (
                <li key={item.id}>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full",
                          item.isInflow
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger",
                        )}
                      >
                        {item.isInflow ? (
                          <ArrowDown className="size-4" aria-hidden />
                        ) : (
                          <ArrowUp className="size-4" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {title}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatShortDate(item.date, i18n.language)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-headline text-sm font-semibold",
                        item.isInflow ? "text-success" : "text-text-main",
                      )}
                    >
                      {item.isInflow ? "+" : "−"}
                      {formatMoney(item.amount, item.currency || currency)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
