"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import type { UpcomingCollection } from "../types";
import { formatShortDate } from "../utils/formatShortDate";
import { getInitials } from "../utils/getInitials";

type UpcomingCollectionsProps = {
  items: UpcomingCollection[];
};

export function UpcomingCollections({ items }: UpcomingCollectionsProps) {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();

  return (
    <section className="space-y-3 lg:col-span-2">
      <h2 className="font-headline text-base font-semibold text-text-main">
        {t("home.upcomingCollections")}
      </h2>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-text-secondary">
            {t("home.emptyCollections")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const isOverdue = item.status === "overdue";

              return (
                <li key={item.id}>
                  <Link
                    href="/loans"
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          isOverdue
                            ? "bg-surface-muted text-text-secondary"
                            : "bg-primary-container text-on-primary-container",
                        )}
                        aria-hidden
                      >
                        {getInitials(item.clientName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {item.clientName}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            isOverdue ? "text-danger" : "text-text-secondary",
                          )}
                        >
                          {formatShortDate(item.dueDate, i18n.language)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-headline text-sm font-semibold text-text-main">
                        {formatMoney(item.amount, currency)}
                      </p>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
                          isOverdue
                            ? "bg-danger/15 text-danger"
                            : "bg-primary-container text-on-primary-container",
                        )}
                      >
                        {isOverdue
                          ? t("loans.statusOverdue")
                          : t("loans.statusActive")}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
