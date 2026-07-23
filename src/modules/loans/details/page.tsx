"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSessionOrganization } from "@/modules/auth/hooks";
import { ErrorState } from "@/shared/components/ErrorState";

import { useLoanDetail } from "../hooks/useLoanDetail";
import type { LoanPayment } from "../types";
import { principalRemainingAfterPayment } from "../utils/principalRemainingAfter";
import { EditNextPaymentDateModal } from "./components/EditNextPaymentDateModal";
import { LoanDetailHeader } from "./components/LoanDetailHeader";
import { LoanDetailPageSkeleton } from "./components/LoanDetailPageSkeleton";
import { LoanDetailStats } from "./components/LoanDetailStats";
import { LoanPaymentsTable } from "./components/LoanPaymentsTable";
import { PaymentDetailModal } from "./components/PaymentDetailModal";
import { RegisterPaymentModal } from "./components/RegisterPaymentModal";

export function LoanDetailsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const loanId = typeof params?.id === "string" ? params.id : undefined;
  const { data, isLoading, isError, error, refetch } = useLoanDetail(loanId);
  const { isOperator } = useSessionOrganization();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editDateOpen, setEditDateOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<LoanPayment | null>(
    null,
  );

  const principalAfter = useMemo(() => {
    if (!data || !selectedPayment) {
      return 0;
    }
    return principalRemainingAfterPayment(
      data.loan.initialAmount,
      data.payments,
      selectedPayment.id,
    );
  }, [data, selectedPayment]);

  if (isLoading) {
    return <LoanDetailPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("loans.loanDetails")}
        description={
          error instanceof Error ? error.message : t("loans.loanNotFound")
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const { loan, payments } = data;
  const canRegisterPayment =
    isOperator &&
    (loan.status === "active" || loan.status === "overdue") &&
    loan.currentPrincipal > 0;
  const canEditNextPayment =
    isOperator && (loan.status === "active" || loan.status === "overdue");

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <Link
        href="/loans"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("loans.backToList")}
      </Link>

      <LoanDetailHeader
        loan={loan}
        canRegisterPayment={canRegisterPayment}
        onRegisterPayment={() => setRegisterOpen(true)}
      />

      <LoanDetailStats
        loan={loan}
        canEditNextPayment={canEditNextPayment}
        onEditNextPayment={() => setEditDateOpen(true)}
      />

      {loan.description ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">
            {t("common.descriptionLabel")}
          </p>
          <p className="mt-1 text-sm text-text-main">{loan.description}</p>
        </section>
      ) : null}

      <LoanPaymentsTable
        payments={payments}
        currency={loan.currency}
        onSelectPayment={setSelectedPayment}
      />

      {canRegisterPayment ? (
        <RegisterPaymentModal
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          loan={loan}
        />
      ) : null}

      {canEditNextPayment ? (
        <EditNextPaymentDateModal
          open={editDateOpen}
          onClose={() => setEditDateOpen(false)}
          loan={loan}
        />
      ) : null}

      <PaymentDetailModal
        open={Boolean(selectedPayment)}
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        currency={loan.currency}
        principalRemainingAfter={principalAfter}
        ns="loans"
        onRegisterPayment={
          selectedPayment?.status === "pending" && canRegisterPayment
            ? () => setRegisterOpen(true)
            : undefined
        }
      />
    </div>
  );
}
