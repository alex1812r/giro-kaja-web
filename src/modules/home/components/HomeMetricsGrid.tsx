"use client";

import {
  AlertTriangle,
  Landmark,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCurrency } from "@/shared/currency";
import { formatMoney } from "@/shared/utils/formatMoney";

import type { HomeDashboardMetrics } from "../types";
import { MetricCard } from "./MetricCard";

type HomeMetricsGridProps = {
  metrics: HomeDashboardMetrics;
};

export function HomeMetricsGrid({ metrics }: HomeMetricsGridProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label={t("home.capitalInCash")}
        value={formatMoney(metrics.capitalInCash, currency)}
        icon={Landmark}
        iconClassName="text-primary"
      />
      <MetricCard
        label={t("home.totalLent")}
        value={formatMoney(metrics.totalLent, currency)}
        icon={Banknote}
        iconClassName="text-success"
      />
      <MetricCard
        label={t("home.projectedInterest")}
        value={formatMoney(metrics.projectedInterest, currency)}
        icon={TrendingUp}
        iconClassName="text-warning"
      />
      <MetricCard
        label={t("home.overdueAlerts")}
        value={String(metrics.overdueAlerts)}
        icon={AlertTriangle}
        tone="danger"
      />
    </div>
  );
}
