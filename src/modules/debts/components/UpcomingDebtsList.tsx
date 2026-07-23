"use client";

import { useTranslation } from "react-i18next";

import type { DebtListItem } from "../types";
import { DebtListRow } from "./DebtListRow";

type UpcomingDebtsListProps = {
  items: DebtListItem[];
};

export function UpcomingDebtsList({ items }: UpcomingDebtsListProps) {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="font-headline text-base font-semibold text-text-main">
          {t("debts.upcomingDue")}
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="space-y-1 p-5 text-center">
          <p className="text-sm font-medium text-text-main">{t("debts.noDebts")}</p>
          <p className="text-xs text-text-secondary">{t("debts.noDebtsSubtitle")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <DebtListRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
