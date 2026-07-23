"use client";

import { useTranslation } from "react-i18next";

import {
  CreateOrganizationForm,
  type CreateOrganizationFormValues,
} from "@/modules/organizations/onboarding/components/CreateOrganizationForm";
import { Modal } from "@/shared/components/Modal";

type CreateOrganizationModalProps = {
  open: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: CreateOrganizationFormValues) => void;
};

export function CreateOrganizationModal({
  open,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: CreateOrganizationModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("myOrganizations.createTitle")}
    >
      <p className="mb-4 text-sm text-text-secondary">
        {t("myOrganizations.createSubtitle")}
      </p>
      <CreateOrganizationForm
        isSubmitting={isPending}
        errorMessage={errorMessage ?? undefined}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
