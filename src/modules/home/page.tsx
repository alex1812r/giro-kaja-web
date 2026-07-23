"use client";

import { useTranslation } from "react-i18next";

import { ErrorState } from "@/shared/components/ErrorState";

import { HomeMetricsGrid } from "./components/HomeMetricsGrid";
import { HomePageSkeleton } from "./components/HomePageSkeleton";
import { RecentActivity } from "./components/RecentActivity";
import { UpcomingCollections } from "./components/UpcomingCollections";
import { useHomeDashboard } from "./hooks/useHomeDashboard";

export function HomePage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useHomeDashboard();

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("home.title")}
        description={
          error instanceof Error
            ? error.message
            : t("shell.moduleUnderConstruction")
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-headline text-2xl font-semibold text-text-main">
          {t("home.title")}
        </h1>
        <p className="text-sm text-text-secondary">{t("home.summary")}</p>
      </header>

      <HomeMetricsGrid metrics={data.metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UpcomingCollections items={data.upcomingCollections} />
        <RecentActivity items={data.recentActivity} />
      </div>
    </div>
  );
}
