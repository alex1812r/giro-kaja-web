"use client";

import { useTranslation } from "react-i18next";

import { MOVEMENT_TYPE_FILTER_OPTIONS } from "@/modules/cash-register/services/transactionTypeMap";
import { currencyOptions, type CurrencyCode } from "@/shared/currency";
import { DateRangeFilter, type DateRangePreset } from "@/shared/date-range";
import { cn } from "@/shared/utils/cn";

type AllMovementsFiltersProps = {
  preset: DateRangePreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomRangeChange: (start: string, end: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export function AllMovementsFilters({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomRangeChange,
  selectedType,
  onTypeChange,
  selectedCurrency,
  onCurrencyChange,
  search,
  onSearchChange,
}: AllMovementsFiltersProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-main">
          {t("cashRegister.filterByDate")}
        </p>
        <DateRangeFilter
          preset={preset}
          customStart={customStart}
          customEnd={customEnd}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-main">
            {t("cashRegister.movementType")}
          </span>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className={cn(
              "h-10 rounded-md border border-border bg-surface px-3 text-sm text-text-main",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
            )}
          >
            {MOVEMENT_TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value ?? "all"} value={opt.value ?? ""}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-main">
            {t("cashRegister.currency")}
          </span>
          <select
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className={cn(
              "h-10 rounded-md border border-border bg-surface px-3 text-sm text-text-main",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
            )}
          >
            {currencyOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text-main">
          {t("cashRegister.searchPlaceholder")}
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("cashRegister.searchPlaceholder")}
          className={cn(
            "h-10 rounded-md border border-border bg-surface px-3 text-sm text-text-main",
            "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
          )}
        />
      </label>
    </section>
  );
}
