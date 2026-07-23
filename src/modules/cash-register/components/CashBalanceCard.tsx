"use client";

import { ArrowLeftRight, Landmark, MinusCircle, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button/Button";
import { useCurrency } from "@/shared/currency";
import { formatMoney } from "@/shared/utils/formatMoney";

type CashBalanceCardProps = {
  balance: number;
  debtDue?: number;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onTransfer?: () => void;
};

export function CashBalanceCard({
  balance,
  debtDue = 0,
  onDeposit,
  onWithdraw,
  onTransfer,
}: CashBalanceCardProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const showDebt = debtDue > 0;
  const net = balance - debtDue;

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary-container/30 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-col md:flex-row md:items-stretch">
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-2 text-xs text-text-secondary">
              <Landmark className="size-4 shrink-0" aria-hidden />
              {t("cashRegister.capitalInCash")}
            </p>
            <p className="font-headline flex flex-wrap items-baseline gap-2 text-2xl font-semibold tracking-tight text-text-main">
              <span>{formatMoney(balance, currency)}</span>
              <span className="text-sm font-normal text-text-secondary">
                {currency}
              </span>
            </p>
          </div>

          {showDebt ? (
            <div className="mt-3 flex flex-col justify-center gap-1.5 border-t border-border pt-3 text-sm md:mt-0 md:ml-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
              <div className="flex justify-between gap-6 md:justify-start md:gap-3">
                <span className="text-text-secondary">
                  {t("cashRegister.debtDue")}
                </span>
                <span className="font-medium text-danger">
                  {formatMoney(debtDue, currency)}
                </span>
              </div>
              <div className="flex justify-between gap-6 md:justify-start md:gap-3">
                <span className="text-text-secondary">
                  {t("cashRegister.netAvailable")}
                </span>
                <span className="font-headline font-semibold text-primary">
                  {formatMoney(net, currency)}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onDeposit}>
            <PlusCircle className="size-4" aria-hidden />
            {t("cashRegister.depositCta")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="border-primary/30 text-primary hover:bg-primary-light"
            onClick={onWithdraw}
          >
            <MinusCircle className="size-4" aria-hidden />
            {t("cashRegister.withdrawCta")}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onTransfer}>
            <ArrowLeftRight className="size-4" aria-hidden />
            {t("cashRegister.transferCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
