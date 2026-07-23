"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { LoanListItem } from "../../types";
import { LoanListRow } from "../../components/LoanListRow";

type AllLoansListProps = {
  items: LoanListItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function AllLoansList({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: AllLoansListProps) {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-text-main">{t("loans.noLoans")}</p>
        <p className="mt-1 text-xs text-text-secondary">
          {t("loans.noLoansFilterSubtitle")}
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <LoanListRow key={item.id} item={item} />
        ))}
      </ul>

      <div ref={sentinelRef} className="px-4 py-3 text-center">
        {isFetchingNextPage ? (
          <p className="text-sm text-text-secondary">{t("common.loading")}</p>
        ) : hasNextPage ? (
          <button
            type="button"
            onClick={onLoadMore}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            {t("common.loadMore")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
