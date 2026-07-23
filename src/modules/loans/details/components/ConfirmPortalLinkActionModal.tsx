"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

export type PortalLinkConfirmAction = "regenerate" | "revoke";

type ConfirmPortalLinkActionModalProps = {
  action: PortalLinkConfirmAction | null;
  open: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmPortalLinkActionModal({
  action,
  open,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: ConfirmPortalLinkActionModalProps) {
  const { t } = useTranslation();

  const isRevoke = action === "revoke";
  const title = isRevoke
    ? t("loans.portalLinkRevokeTitle")
    : t("loans.portalLinkRegenerateTitle");
  const body = isRevoke
    ? t("loans.portalLinkRevokeConfirm")
    : t("loans.portalLinkRegenerateConfirm");
  const confirmLabel = isRevoke
    ? t("loans.portalLinkRevoke")
    : t("loans.portalLinkRegenerate");

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
            variant={isRevoke ? "danger" : "primary"}
            disabled={isPending || !action}
            onClick={onConfirm}
          >
            {isPending ? t("common.loading") : confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-text-secondary">
        <p>{body}</p>
        <p>{t("loans.portalLinkClientScopeWarning")}</p>
        {errorMessage ? (
          <p className="text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
