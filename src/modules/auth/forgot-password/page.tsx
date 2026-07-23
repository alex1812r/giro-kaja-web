"use client";

import { useTranslation } from "react-i18next";

import { AuthCard, AuthPageShell } from "@/modules/auth/components";
import { ClientApiError } from "@/shared/api/apiFetch";

import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { useForgotPassword } from "./hooks/useForgotPassword";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const forgotPassword = useForgotPassword();

  return (
    <AuthPageShell>
      <AuthCard
        showBrand={false}
        heading={t("forgotPassword.heading")}
        description={t("forgotPassword.description")}
      >
        <ForgotPasswordForm
          isSubmitting={forgotPassword.isPending}
          successMessage={
            forgotPassword.data
              ? (forgotPassword.data.message || t("forgotPassword.successDefault"))
              : undefined
          }
          errorMessage={
            forgotPassword.error instanceof ClientApiError
              ? forgotPassword.error.message
              : forgotPassword.error
                ? t("forgotPassword.errorGeneric")
                : undefined
          }
          onSubmit={(values) => {
            forgotPassword.mutate(values);
          }}
        />
      </AuthCard>
    </AuthPageShell>
  );
}
