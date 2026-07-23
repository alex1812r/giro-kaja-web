"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

type ConfirmDeleteOrganizationModalProps = {
  organizationName: string;
  open: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteOrganizationModal({
  organizationName,
  open,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: ConfirmDeleteOrganizationModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("admin.confirmDeleteOrgTitle")}
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
            {isPending ? t("common.loading") : t("admin.deleteOrganization")}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-text-secondary">
        <p>{t("admin.confirmDeleteOrgBody", { name: organizationName })}</p>
        <p>{t("admin.confirmDeleteOrgDataWarning")}</p>
        {errorMessage ? (
          <p className="text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
