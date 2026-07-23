"use client";

import { useTranslation } from "react-i18next";

import type { AdminUserListItem } from "@/modules/admin/types";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

type ConfirmDeleteUserModalProps = {
  user: AdminUserListItem | null;
  open: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteUserModal({
  user,
  open,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: ConfirmDeleteUserModalProps) {
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  const operatorOrgs = user.memberships.filter(
    (m) => m.role === "owner" || m.role === "admin",
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("admin.confirmDeleteUserTitle")}
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
            {isPending ? t("common.loading") : t("admin.deleteUser")}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-text-secondary">
        <p>{t("admin.confirmDeleteUserBody", { name: user.name })}</p>
        {operatorOrgs.length > 0 ? (
          <p>{t("admin.confirmDeleteUserSoleAdminWarning")}</p>
        ) : null}
        {errorMessage ? (
          <p className="text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
