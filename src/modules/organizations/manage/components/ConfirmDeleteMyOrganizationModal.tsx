"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

type ConfirmDeleteMyOrganizationModalProps = {
  organizationName: string;
  open: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteMyOrganizationModal({
  organizationName,
  open,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: ConfirmDeleteMyOrganizationModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("myOrganizations.confirmDeleteTitle")}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending
              ? t("common.loading")
              : t("myOrganizations.deleteAction")}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-text-secondary">
        <p>
          {t("myOrganizations.confirmDeleteBody", { name: organizationName })}
        </p>
        <p>{t("myOrganizations.confirmDeleteWarning")}</p>
        {errorMessage ? (
          <p className="text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
