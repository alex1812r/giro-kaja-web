"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/shared/utils/cn";

import type { DateRangePreset } from "./types";

const PRESETS: Exclude<DateRangePreset, "custom">[] = ["1m", "3m", "6m"];

const PRESET_KEYS: Record<DateRangePreset, string> = {
  "1m": "home.dateRange1m",
  "3m": "home.dateRange3m",
  "6m": "home.dateRange6m",
  custom: "home.dateRangeCustom",
};

type DateRangeFilterProps = {
  preset: DateRangePreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomRangeChange: (start: string, end: string) => void;
};

export function DateRangeFilter({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomRangeChange,
}: DateRangeFilterProps) {
  const { t } = useTranslation();
  const showCustom = preset === "custom";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        showCustom && "md:flex-row md:flex-wrap md:items-center",
      )}
      role="group"
      aria-label={t("loans.filterByCutoffDate")}
    >
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((value) => {
          const active = preset === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onPresetChange(value)}
              className={cn(
                "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-border bg-surface text-text-main hover:bg-surface-muted",
              )}
            >
              {t(PRESET_KEYS[value])}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onPresetChange("custom")}
          className={cn(
            "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors",
            showCustom
              ? "border-primary bg-primary-container text-on-primary-container"
              : "border-border bg-surface text-text-main hover:bg-surface-muted",
          )}
        >
          {t(PRESET_KEYS.custom)}
        </button>
      </div>

      {showCustom ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-1 md:items-center md:gap-2">
          <label className="flex min-w-0 flex-col gap-1 md:block md:flex-1">
            <span className="text-xs text-text-secondary md:sr-only">
              {t("home.startDateLabel")}
            </span>
            <input
              type="date"
              value={customStart}
              aria-label={t("home.startDateLabel")}
              onChange={(event) =>
                onCustomRangeChange(
                  event.target.value,
                  customEnd || event.target.value,
                )
              }
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1 md:block md:flex-1">
            <span className="text-xs text-text-secondary md:sr-only">
              {t("home.endDateLabel")}
            </span>
            <input
              type="date"
              value={customEnd}
              aria-label={t("home.endDateLabel")}
              onChange={(event) =>
                onCustomRangeChange(
                  customStart || event.target.value,
                  event.target.value,
                )
              }
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
