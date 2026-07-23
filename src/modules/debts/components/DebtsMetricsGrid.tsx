"use client";

import { Banknote, Percent, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MetricCard } from "@/modules/home/components/MetricCard";
import { useCurrency } from "@/shared/currency";
import { formatMoney } from "@/shared/utils/formatMoney";

import type { DebtsSummaryMetrics } from "../types";

type DebtsMetricsGridProps = {
  metrics: DebtsSummaryMetrics;
};

export function DebtsMetricsGrid({ metrics }: DebtsMetricsGridProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        label={t("debts.totalOwed")}
        value={formatMoney(metrics.totalOwed, currency)}
        icon={Banknote}
        iconClassName="text-primary"
      />
      <MetricCard
        label={t("debts.projectionNextMonthShort")}
        value={formatMoney(metrics.projectionNextMonth, currency)}
        icon={TrendingDown}
        iconClassName="text-warning"
      />
      <MetricCard
        label={t("debts.interestCostShort")}
        value={formatMoney(metrics.interestCost, currency)}
        icon={Percent}
        iconClassName="text-danger"
      />
    </div>
  );
}
