"use client";

import { useTranslation } from "react-i18next";

import type { LoanListItem } from "../types";
import { LoanListRow } from "./LoanListRow";

type UpcomingLoansListProps = {
  items: LoanListItem[];
};

export function UpcomingLoansList({ items }: UpcomingLoansListProps) {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="font-headline text-base font-semibold text-text-main">
          {t("loans.upcomingDue")}
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="space-y-1 p-5 text-center">
          <p className="text-sm font-medium text-text-main">{t("loans.noLoans")}</p>
          <p className="text-xs text-text-secondary">
            {t("loans.noLoansSubtitle")}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <LoanListRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
