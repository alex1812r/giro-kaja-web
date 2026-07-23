"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CashMovement } from "@/modules/cash-register/types";
import { ErrorState } from "@/shared/components/ErrorState";
import {
  isCurrencyCode,
  useCurrency,
  type CurrencyCode,
} from "@/shared/currency";
import { useDateRangeFilter } from "@/shared/date-range";

import { useCashMovementsInfinite } from "../hooks/useCashMovementsInfinite";
import { AllMovementsFilters } from "./components/AllMovementsFilters";
import { AllMovementsList } from "./components/AllMovementsList";
import { AllMovementsPageSkeleton } from "./components/AllMovementsPageSkeleton";
import { MovementDetailModal } from "./components/MovementDetailModal";

export function CashRegisterMovementsPage() {
  const { t } = useTranslation();
  const { currency: sessionCurrency } = useCurrency();
  const dateRange = useDateRangeFilter("1m");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>(sessionCurrency);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [detail, setDetail] = useState<CashMovement | null>(null);

  useEffect(() => {
    setSelectedCurrency(sessionCurrency);
  }, [sessionCurrency]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const filters = useMemo(
    () => ({
      startDate: dateRange.from,
      endDate: dateRange.to,
      currency: selectedCurrency,
      type: selectedType || undefined,
      search: debouncedSearch || undefined,
    }),
    [
      dateRange.from,
      dateRange.to,
      selectedCurrency,
      selectedType,
      debouncedSearch,
    ],
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
  } = useCashMovementsInfinite(filters);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const isListLoading = isLoading || (isFetching && !isFetchingNextPage);

  if (isLoading && items.length === 0) {
    return <AllMovementsPageSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <div className="space-y-3">
        <Link
          href="/cash-register"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("cashRegister.backToRegister")}
        </Link>

        <header className="space-y-1">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {t("cashRegister.allMovements")}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("cashRegister.allMovementsSubtitle")}
          </p>
        </header>
      </div>

      <AllMovementsFilters
        preset={dateRange.preset}
        customStart={dateRange.customStart}
        customEnd={dateRange.customEnd}
        onPresetChange={dateRange.setPreset}
        onCustomRangeChange={dateRange.setCustomRange}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={(code) => {
          if (isCurrencyCode(code)) {
            setSelectedCurrency(code);
          }
        }}
        search={search}
        onSearchChange={setSearch}
      />

      {isListLoading ? (
        <AllMovementsPageSkeleton />
      ) : isError ? (
        <ErrorState
          title={t("cashRegister.allMovements")}
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
        <AllMovementsList
          items={items}
          hasNextPage={Boolean(hasNextPage)}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => {
            void fetchNextPage();
          }}
          onSelect={setDetail}
        />
      )}

      <MovementDetailModal
        movement={detail}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
