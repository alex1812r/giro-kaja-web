"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useClientsList } from "@/modules/clients/hooks/useClientsList";
import { ErrorState } from "@/shared/components/ErrorState";
import { useCurrency } from "@/shared/currency";
import { useDateRangeFilter } from "@/shared/date-range";

import { AllLoansFilters } from "../all/components/AllLoansFilters";
import { AllLoansList } from "../all/components/AllLoansList";
import { AllLoansListSkeleton } from "../all/components/AllLoansListSkeleton";
import { AllLoansPageSkeleton } from "../all/components/AllLoansPageSkeleton";
import { useLoansListInfinite } from "../hooks/useLoansListInfinite";

/**
 * Simplified loans workspace for organization viewers:
 * list + filters only (no metrics dashboard, no create).
 */
export function ViewerLoansPage() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const dateRange = useDateRangeFilter("1m", { direction: "future" });
  const [selectedClientId, setSelectedClientId] = useState("");
  const { data: clients = [], isLoading: isLoadingClients } = useClientsList();

  const filters = useMemo(
    () => ({
      currency,
      clientId: selectedClientId || undefined,
      nextPaymentDateFrom: dateRange.from,
      nextPaymentDateTo: dateRange.to,
    }),
    [currency, selectedClientId, dateRange.from, dateRange.to],
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
  } = useLoansListInfinite(filters);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const isListLoading = isLoading || (isFetching && !isFetchingNextPage);

  if (isLoadingClients) {
    return <AllLoansPageSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-headline text-2xl font-semibold text-text-main">
          {t("loans.viewerTitle")}
        </h1>
        <p className="text-sm text-text-secondary">{t("loans.viewerSubtitle")}</p>
      </header>

      <AllLoansFilters
        preset={dateRange.preset}
        customStart={dateRange.customStart}
        customEnd={dateRange.customEnd}
        onPresetChange={dateRange.setPreset}
        onCustomRangeChange={dateRange.setCustomRange}
        clients={clients}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
      />

      {isListLoading ? (
        <AllLoansListSkeleton />
      ) : isError ? (
        <ErrorState
          title={t("loans.viewerTitle")}
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
        <AllLoansList
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
