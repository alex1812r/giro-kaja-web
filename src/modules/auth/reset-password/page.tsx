"use client";

import { useTranslation } from "react-i18next";

import { AuthCard, AuthPageShell } from "@/modules/auth/components";
import { ClientApiError } from "@/shared/api/apiFetch";

import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { useResetPassword } from "./hooks/useResetPassword";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const resetPassword = useResetPassword();

  return (
    <AuthPageShell>
      <AuthCard
        showBrand={false}
        heading={t("resetPassword.heading")}
        description={t("resetPassword.description")}
      >
        <ResetPasswordForm
          isSubmitting={resetPassword.isPending}
          errorMessage={
            resetPassword.error instanceof ClientApiError
              ? resetPassword.error.message
              : resetPassword.error
                ? t("resetPassword.errorGeneric")
                : undefined
          }
          onSubmit={(values) => {
            resetPassword.mutate(values);
          }}
        />
      </AuthCard>
    </AuthPageShell>
  );
}
