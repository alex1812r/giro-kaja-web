"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { DateRangeFilter, type DateRangePreset } from "@/shared/date-range";

type AllDebtsFiltersProps = {
  preset: DateRangePreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomRangeChange: (start: string, end: string) => void;
  lenderQuery: string;
  onLenderQueryChange: (value: string) => void;
};

export function AllDebtsFilters({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomRangeChange,
  lenderQuery,
  onLenderQueryChange,
}: AllDebtsFiltersProps) {
  const { t } = useTranslation();
  const lenderId = useId();

  return (
    <section className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-main">
          {t("debts.filterByCutoffDate")}
        </p>
        <DateRangeFilter
          preset={preset}
          customStart={customStart}
          customEnd={customEnd}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={lenderId} className="text-sm font-medium text-text-main">
          {t("debts.filterByLender")}
        </label>
        <input
          id={lenderId}
          type="search"
          value={lenderQuery}
          onChange={(event) => onLenderQueryChange(event.target.value)}
          placeholder={t("debts.lenderSearchPlaceholder")}
          className="h-10 w-full max-w-md rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </section>
  );
}
