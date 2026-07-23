"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "@/shared/components/ErrorState";

import { CashBalanceCard } from "./components/CashBalanceCard";
import { CashRegisterPageSkeleton } from "./components/CashRegisterPageSkeleton";
import { DepositModal } from "./components/DepositModal";
import { RecentMovements } from "./components/RecentMovements";
import { TransferModal } from "./components/TransferModal";
import { WithdrawModal } from "./components/WithdrawModal";
import { useCashRegisterSummary } from "./hooks/useCashRegisterSummary";

export function CashRegisterPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useCashRegisterSummary();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  if (isLoading) {
    return <CashRegisterPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("cashRegister.title")}
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
          {t("cashRegister.title")}
        </h1>
        <p className="text-sm text-text-secondary">
          {t("cashRegister.subtitle")}
        </p>
      </header>

      <CashBalanceCard
        balance={data.balance}
        debtDue={data.debtDue}
        onDeposit={() => setDepositOpen(true)}
        onWithdraw={() => setWithdrawOpen(true)}
        onTransfer={() => setTransferOpen(true)}
      />

      <RecentMovements items={data.recentMovements} />

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        currentBalance={data.balance}
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        currentBalance={data.balance}
      />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </div>
  );
}
