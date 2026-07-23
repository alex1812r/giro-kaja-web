"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSessionOrganization } from "@/modules/auth/hooks";
import { useClientsList } from "@/modules/clients/hooks/useClientsList";
import { ErrorState } from "@/shared/components/ErrorState";
import { useCurrency } from "@/shared/currency";
import { useDateRangeFilter } from "@/shared/date-range";

import { ViewerLoansPage } from "../components/ViewerLoansPage";
import { useLoansListInfinite } from "../hooks/useLoansListInfinite";
import { AllLoansFilters } from "./components/AllLoansFilters";
import { AllLoansList } from "./components/AllLoansList";
import { AllLoansListSkeleton } from "./components/AllLoansListSkeleton";
import { AllLoansPageSkeleton } from "./components/AllLoansPageSkeleton";

export function AllLoansPage() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { isViewer, isLoading: isSessionLoading } = useSessionOrganization();
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
  } = useLoansListInfinite(filters, {
    enabled: !isSessionLoading && !isViewer,
  });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const isListLoading = isLoading || (isFetching && !isFetchingNextPage);

  if (isSessionLoading || isLoadingClients) {
    return <AllLoansPageSkeleton />;
  }

  if (isViewer) {
    return <ViewerLoansPage />;
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <div className="space-y-3">
        <Link
          href="/loans"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("loans.backToList")}
        </Link>

        <header className="space-y-1">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {t("loans.allLoansTitle")}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("loans.allLoansSubtitle")}
          </p>
        </header>
      </div>

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
          title={t("loans.allLoansTitle")}
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
