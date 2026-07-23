"use client";

import { useTranslation } from "react-i18next";

import type { LoanPayment } from "@/modules/loans/types";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

type PaymentDetailModalProps = {
  payment: LoanPayment | null;
  open: boolean;
  onClose: () => void;
  currency: string;
  principalRemainingAfter: number;
  /** i18n namespace: loans | debts */
  ns?: "loans" | "debts";
  onRegisterPayment?: () => void;
};

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={cn(
          "text-right text-sm font-semibold text-text-main",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PaymentDetailModal({
  payment,
  open,
  onClose,
  currency,
  principalRemainingAfter,
  ns = "loans",
  onRegisterPayment,
}: PaymentDetailModalProps) {
  const { t, i18n } = useTranslation();

  if (!payment) {
    return null;
  }

  const isPaid = payment.status === "paid";
  const isInterestOnly = payment.amortizationAmount === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isPaid ? t(`${ns}.paymentDetail`) : t(`${ns}.pendingPayment`)}
      footer={
        !isPaid && onRegisterPayment ? (
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                onClose();
                onRegisterPayment();
              }}
            >
              {t(
                ns === "debts"
                  ? "debts.registerDebtPayment"
                  : "loans.registerPayment",
              )}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold tracking-wide uppercase",
            isPaid
              ? "bg-success/15 text-success"
              : "bg-primary-light text-primary",
          )}
        >
          {isPaid ? t(`${ns}.statusPaid`) : t(`${ns}.statusPending`)}
        </span>

        <div>
          {isInterestOnly ? (
            <DetailRow
              label={t(`${ns}.interestDueThisPeriod`)}
              value={formatMoney(payment.interestAmount, currency)}
              valueClassName="text-primary"
            />
          ) : (
            <>
              <DetailRow
                label={t(`${ns}.totalAmount`)}
                value={formatMoney(payment.totalAmount, currency)}
                valueClassName="text-primary"
              />
              <DetailRow
                label={t(`${ns}.interest`)}
                value={formatMoney(payment.interestAmount, currency)}
              />
              <DetailRow
                label={t(`${ns}.amortizationPrincipal`)}
                value={formatMoney(payment.amortizationAmount, currency)}
              />
            </>
          )}
          <DetailRow
            label={t(`${ns}.principalRemainingAfter`)}
            value={formatMoney(principalRemainingAfter, currency)}
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-text-secondary uppercase">
            {t(`${ns}.dates`)}
          </p>
          <DetailRow
            label={isPaid ? t(`${ns}.paymentDate`) : t(`${ns}.expectedBy`)}
            value={formatShortDate(payment.paymentDate, i18n.language)}
          />
        </div>

        {payment.description?.trim() ? (
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-text-secondary uppercase">
              {t("common.descriptionLabel")}
            </p>
            <p className="text-sm text-text-main">{payment.description.trim()}</p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
