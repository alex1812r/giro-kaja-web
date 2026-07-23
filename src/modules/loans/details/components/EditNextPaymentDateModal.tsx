"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ClientApiError } from "@/shared/api/apiFetch";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

import { useUpdateLoan } from "../../hooks/useUpdateLoan";
import type { LoanDetail } from "../../types";

type EditNextPaymentDateModalProps = {
  open: boolean;
  onClose: () => void;
  loan: LoanDetail;
};

export function EditNextPaymentDateModal({
  open,
  onClose,
  loan,
}: EditNextPaymentDateModalProps) {
  const { t } = useTranslation();
  const updateLoan = useUpdateLoan(loan.id);
  const [nextPaymentDate, setNextPaymentDate] = useState(loan.nextPaymentDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setNextPaymentDate(loan.nextPaymentDate.slice(0, 10));
    setErrorMessage(null);
  }, [open, loan.nextPaymentDate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await updateLoan.mutateAsync({ nextPaymentDate });
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof ClientApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("loans.editNextPaymentFailed"),
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("loans.editNextPaymentTitle")}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={updateLoan.isPending}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="edit-next-payment-form"
            disabled={updateLoan.isPending}
          >
            {updateLoan.isPending
              ? t("common.loading")
              : t("loans.editNextPaymentSave")}
          </Button>
        </div>
      }
    >
      <form
        id="edit-next-payment-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
      >
        <p className="text-sm text-text-secondary">
          {t("loans.editNextPaymentSubtitle", { client: loan.clientName })}
        </p>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-main">
            {t("loans.formNextPaymentDate")}
          </span>
          <input
            required
            type="date"
            value={nextPaymentDate}
            onChange={(e) => setNextPaymentDate(e.target.value)}
            className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none focus:border-primary"
          />
        </label>
        {errorMessage ? (
          <p className="text-sm text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
