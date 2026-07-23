"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cashMovementLabel } from "@/modules/cash-register/services/transactionTypeMap";
import type { CashMovement } from "@/modules/cash-register/types";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

type AllMovementsListProps = {
  items: CashMovement[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onSelect: (item: CashMovement) => void;
};

export function AllMovementsList({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onSelect,
}: AllMovementsListProps) {
  const { t, i18n } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-text-main">
          {t("cashRegister.noMovements")}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          {t("cashRegister.noMovementsSubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const title = cashMovementLabel(item, t);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-muted/60"
              >
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
                      {" · "}
                      {item.currency}
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
                  {formatMoney(item.amount, item.currency)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {hasNextPage ? (
        <div className="border-t border-border p-3 text-center">
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
            className="text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-60"
          >
            {isFetchingNextPage ? t("common.loading") : t("common.loadMore")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
