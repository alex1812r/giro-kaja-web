"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "@/shared/components/ErrorState";
import { useDateRangeFilter } from "@/shared/date-range";

import { useDebtsListInfinite } from "../hooks/useDebtsListInfinite";
import { AllDebtsFilters } from "./components/AllDebtsFilters";
import { AllDebtsList } from "./components/AllDebtsList";
import { AllDebtsListSkeleton } from "./components/AllDebtsListSkeleton";

export function AllDebtsPage() {
  const { t } = useTranslation();
  const dateRange = useDateRangeFilter("1m");
  const [lenderQuery, setLenderQuery] = useState("");

  const filters = useMemo(
    () => ({
      lender: lenderQuery.trim() || undefined,
      nextPaymentDateFrom: dateRange.from,
      nextPaymentDateTo: dateRange.to,
    }),
    [lenderQuery, dateRange.from, dateRange.to],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDebtsListInfinite(filters);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const isListLoading = isLoading || (isFetching && !isFetchingNextPage);

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <div className="space-y-3">
        <Link
          href="/debts"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("debts.backToList")}
        </Link>

        <header className="space-y-1">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {t("debts.allDebtsTitle")}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("debts.allDebtsSubtitle")}
          </p>
        </header>
      </div>

      <AllDebtsFilters
        preset={dateRange.preset}
        customStart={dateRange.customStart}
        customEnd={dateRange.customEnd}
        onPresetChange={dateRange.setPreset}
        onCustomRangeChange={dateRange.setCustomRange}
        lenderQuery={lenderQuery}
        onLenderQueryChange={setLenderQuery}
      />

      {isListLoading ? (
        <AllDebtsListSkeleton />
      ) : isError ? (
        <ErrorState
          title={t("debts.allDebtsTitle")}
          description={
            error instanceof Error
              ? error.message
              : t("shell.moduleUnderConstruction")
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <AllDebtsList
          items={items}
          hasNextPage={Boolean(hasNextPage)}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => {
            void fetchNextPage();
          }}
        />
      )}
    </div>
  );
}
