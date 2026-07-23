"use client";

import { Banknote, Percent, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MetricCard } from "@/modules/home/components/MetricCard";
import { useCurrency } from "@/shared/currency";
import { formatMoney } from "@/shared/utils/formatMoney";

import type { LoansSummaryMetrics } from "../types";

type LoansMetricsGridProps = {
  metrics: LoansSummaryMetrics;
};

export function LoansMetricsGrid({ metrics }: LoansMetricsGridProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        label={t("loans.totalLent")}
        value={formatMoney(metrics.totalLent, currency)}
        icon={Banknote}
        iconClassName="text-primary"
      />
      <MetricCard
        label={t("loans.projectionNextMonthShort")}
        value={formatMoney(metrics.projectionNextMonth, currency)}
        icon={TrendingUp}
        iconClassName="text-success"
      />
      <MetricCard
        label={t("loans.interestGainShort")}
        value={formatMoney(metrics.interestGain, currency)}
        icon={Percent}
        iconClassName="text-success"
      />
    </div>
  );
}
