"use client";

import { useTranslation } from "react-i18next";

import type { AdminUserListItem } from "@/modules/admin/types";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

type ConfirmUserStatusModalProps = {
  user: AdminUserListItem | null;
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmUserStatusModal({
  user,
  open,
  isPending,
  onClose,
  onConfirm,
}: ConfirmUserStatusModalProps) {
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  const nextActive = !user.isActive;
  const title = nextActive
    ? t("admin.confirmActivateTitle")
    : t("admin.confirmDeactivateTitle");
  const description = nextActive
    ? t("admin.confirmActivateBody", { name: user.name })
    : t("admin.confirmDeactivateBody", { name: user.name });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
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
            variant={nextActive ? "primary" : "danger"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending
              ? t("common.loading")
              : nextActive
                ? t("admin.activate")
                : t("admin.deactivate")}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-text-secondary">{description}</p>
    </Modal>
  );
}
