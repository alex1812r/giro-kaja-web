"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/utils/cn";

import { DebtsMetricsGrid } from "./components/DebtsMetricsGrid";
import { DebtsPageSkeleton } from "./components/DebtsPageSkeleton";
import { UpcomingDebtsList } from "./components/UpcomingDebtsList";
import { useDebtsOverview } from "./hooks/useDebtsOverview";
import { CreateDebtModal } from "./new/components/CreateDebtModal";

const secondaryBtnClass = cn(
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-main",
  "transition-colors hover:bg-surface-muted",
);

const primaryBtnClass = cn(
  "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-on-primary",
  "transition-colors hover:bg-primary-dark",
);

function DebtsPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useDebtsOverview();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setCreateOpen(true);
      router.replace("/debts", { scroll: false });
    }
  }, [searchParams, router]);

  if (isLoading) {
    return <DebtsPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("debts.title")}
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {t("debts.title")}
          </h1>
          <p className="text-sm text-text-secondary">{t("debts.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/debts/all" className={secondaryBtnClass}>
            {t("debts.viewAll")}
          </Link>
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            {t("debts.newDebt")}
          </button>
        </div>
      </header>

      <DebtsMetricsGrid metrics={data.metrics} />

      <UpcomingDebtsList items={data.upcomingDebts} />

      <CreateDebtModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export function DebtsPage() {
  return (
    <Suspense fallback={<DebtsPageSkeleton />}>
      <DebtsPageContent />
    </Suspense>
  );
}
