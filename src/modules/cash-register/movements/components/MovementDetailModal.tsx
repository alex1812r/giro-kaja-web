"use client";

import { useTranslation } from "react-i18next";

import {
  cashMovementLabel,
  isCannedTransactionReason,
} from "@/modules/cash-register/services/transactionTypeMap";
import type { CashMovement } from "@/modules/cash-register/types";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatShortDate } from "@/shared/utils/formatShortDate";

type MovementDetailModalProps = {
  movement: CashMovement | null;
  open: boolean;
  onClose: () => void;
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
          "text-right text-sm font-medium text-text-main",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function MovementDetailModal({
  movement,
  open,
  onClose,
}: MovementDetailModalProps) {
  const { t, i18n } = useTranslation();

  if (!movement) {
    return null;
  }

  const title = cashMovementLabel(movement, t);
  const amountSign = movement.isInflow ? "+" : "−";
  const amountColor = movement.isInflow ? "text-success" : "text-danger";
  const rawReason = movement.reason?.trim() ?? "";
  const description =
    rawReason && !isCannedTransactionReason(rawReason)
      ? rawReason.startsWith("Debt received from ")
        ? rawReason.slice("Debt received from ".length).trim() || "—"
        : rawReason
      : "—";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("cashRegister.movementDetail")}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-surface-muted px-4 py-5 text-center">
          <p className="text-xs text-text-secondary">
            {movement.isInflow
              ? t("cashRegister.deposit")
              : t("cashRegister.withdraw")}
          </p>
          <p className={cn("mt-1 font-headline text-2xl font-bold", amountColor)}>
            {amountSign}
            {formatMoney(movement.amount, movement.currency)}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-text-secondary uppercase">
            {t("cashRegister.details")}
          </p>
          <DetailRow
            label={t("cashRegister.dateTime")}
            value={formatShortDate(movement.date, i18n.language)}
          />
          <DetailRow label={t("cashRegister.type")} value={title} />
          <DetailRow
            label={t("cashRegister.formAmount")}
            value={`${amountSign}${formatMoney(movement.amount, movement.currency)}`}
            valueClassName={amountColor}
          />
          <DetailRow
            label={t("cashRegister.description")}
            value={description}
          />
          <DetailRow
            label={t("cashRegister.currency")}
            value={movement.currency}
          />
        </div>
      </div>
    </Modal>
  );
}
