"use client";

import { useTranslation } from "react-i18next";

import type { MyOrganizationMember } from "@/modules/organizations/types";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

type ConfirmDeleteOrganizationMemberModalProps = {
  member: MyOrganizationMember | null;
  open: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteOrganizationMemberModal({
  member,
  open,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: ConfirmDeleteOrganizationMemberModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("myOrganizations.confirmDeleteMemberTitle")}
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
            disabled={isPending || !member}
            onClick={onConfirm}
          >
            {isPending
              ? t("common.loading")
              : t("myOrganizations.memberDeleteAction")}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-text-secondary">
        <p>
          {t("myOrganizations.confirmDeleteMemberBody", {
            name: member?.name ?? "—",
          })}
        </p>
        <p>{t("myOrganizations.confirmDeleteMemberWarning")}</p>
        {errorMessage ? (
          <p className="text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
