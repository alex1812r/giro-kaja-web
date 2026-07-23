"use client";

import { useTranslation } from "react-i18next";

import { AuthCard, AuthPageShell } from "@/modules/auth/components";
import { ClientApiError } from "@/shared/api/apiFetch";

import { LoginForm } from "./components/LoginForm";
import { useLogin } from "./hooks/useLogin";

export function LoginPage() {
  const { t } = useTranslation();
  const login = useLogin();

  return (
    <AuthPageShell>
      <AuthCard>
        <LoginForm
          isSubmitting={login.isPending}
          errorMessage={
            login.error instanceof ClientApiError
              ? login.error.message
              : login.error
                ? t("login.errorGeneric")
                : undefined
          }
          onSubmit={(values) => {
            login.mutate(values);
          }}
        />
      </AuthCard>
    </AuthPageShell>
  );
}
