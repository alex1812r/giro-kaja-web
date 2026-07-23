"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSessionOrganization } from "@/modules/auth/hooks";
import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/utils/cn";

import { LoansMetricsGrid } from "./components/LoansMetricsGrid";
import { LoansPageSkeleton } from "./components/LoansPageSkeleton";
import { UpcomingLoansList } from "./components/UpcomingLoansList";
import { ViewerLoansPage } from "./components/ViewerLoansPage";
import { useLoansOverview } from "./hooks/useLoansOverview";
import { CreateLoanModal } from "./new/components/CreateLoanModal";

const secondaryBtnClass = cn(
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-main",
  "transition-colors hover:bg-surface-muted",
);

const primaryBtnClass = cn(
  "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-on-primary",
  "transition-colors hover:bg-primary-dark",
);

function OperatorLoansPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useLoansOverview();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setCreateOpen(true);
      router.replace("/loans", { scroll: false });
    }
  }, [searchParams, router]);

  if (isLoading) {
    return <LoansPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("loans.title")}
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
            {t("loans.title")}
          </h1>
          <p className="text-sm text-text-secondary">{t("loans.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/loans/all" className={secondaryBtnClass}>
            {t("loans.viewAll")}
          </Link>
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            {t("loans.newLoan")}
          </button>
        </div>
      </header>

      <LoansMetricsGrid metrics={data.metrics} />

      <UpcomingLoansList items={data.upcomingLoans} />

      <CreateLoanModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export function LoansPage() {
  const session = useSessionOrganization();

  if (session.isLoading) {
    return <LoansPageSkeleton />;
  }

  if (session.isViewer) {
    return <ViewerLoansPage />;
  }

  return <OperatorLoansPage />;
}
