"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { PaymentDetailModal } from "@/modules/loans/details/components/PaymentDetailModal";
import { principalRemainingAfterPayment } from "@/modules/loans/utils/principalRemainingAfter";
import { ErrorState } from "@/shared/components/ErrorState";

import { useDebtDetail } from "../hooks/useDebtDetail";
import type { DebtPayment } from "../types";
import { DebtDetailHeader } from "./components/DebtDetailHeader";
import { DebtDetailPageSkeleton } from "./components/DebtDetailPageSkeleton";
import { DebtDetailStats } from "./components/DebtDetailStats";
import { DebtPaymentsTable } from "./components/DebtPaymentsTable";
import { RegisterDebtPaymentModal } from "./components/RegisterDebtPaymentModal";

export function DebtDetailsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const debtId = typeof params?.id === "string" ? params.id : undefined;
  const { data, isLoading, isError, error, refetch } = useDebtDetail(debtId);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<DebtPayment | null>(
    null,
  );

  const principalAfter = useMemo(() => {
    if (!data || !selectedPayment) {
      return 0;
    }
    return principalRemainingAfterPayment(
      data.debt.initialAmount,
      data.payments,
      selectedPayment.id,
    );
  }, [data, selectedPayment]);

  if (isLoading) {
    return <DebtDetailPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("debts.debtDetails")}
        description={
          error instanceof Error ? error.message : t("debts.debtNotFound")
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const { debt, payments } = data;
  const canRegisterPayment =
    (debt.status === "active" || debt.status === "overdue") &&
    debt.currentPrincipal > 0;

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <Link
        href="/debts"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("debts.backToList")}
      </Link>

      <DebtDetailHeader
        debt={debt}
        canRegisterPayment={canRegisterPayment}
        onRegisterPayment={() => setRegisterOpen(true)}
      />

      <DebtDetailStats debt={debt} />

      {debt.description ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">
            {t("common.descriptionLabel")}
          </p>
          <p className="mt-1 text-sm text-text-main">{debt.description}</p>
        </section>
      ) : null}

      <DebtPaymentsTable
        payments={payments}
        currency={debt.currency}
        onSelectPayment={setSelectedPayment}
      />

      {canRegisterPayment ? (
        <RegisterDebtPaymentModal
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          debt={debt}
        />
      ) : null}

      <PaymentDetailModal
        open={Boolean(selectedPayment)}
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        currency={debt.currency}
        principalRemainingAfter={principalAfter}
        ns="debts"
        onRegisterPayment={
          selectedPayment?.status === "pending" && canRegisterPayment
            ? () => setRegisterOpen(true)
            : undefined
        }
      />
    </div>
  );
}
