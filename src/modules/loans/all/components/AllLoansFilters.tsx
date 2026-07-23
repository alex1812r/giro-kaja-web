"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import type { ClientListItem } from "@/modules/clients/types";
import { ClientAutocomplete } from "@/shared/components/ClientAutocomplete";
import { DateRangeFilter, type DateRangePreset } from "@/shared/date-range";

type AllLoansFiltersProps = {
  preset: DateRangePreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomRangeChange: (start: string, end: string) => void;
  clients: ClientListItem[];
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
};

export function AllLoansFilters({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomRangeChange,
  clients,
  selectedClientId,
  onClientChange,
}: AllLoansFiltersProps) {
  const { t } = useTranslation();
  const clientLabelId = useId();

  return (
    <section className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-main">
          {t("loans.filterByCutoffDate")}
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
        <label
          htmlFor={clientLabelId}
          className="text-sm font-medium text-text-main"
        >
          {t("loans.filterByClient")}
        </label>
        <ClientAutocomplete
          id={clientLabelId}
          clients={clients}
          value={selectedClientId}
          onChange={onClientChange}
        />
      </div>
    </section>
  );
}
