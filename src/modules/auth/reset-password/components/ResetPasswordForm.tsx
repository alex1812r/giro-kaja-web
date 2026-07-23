"use client";

import { ArrowLeft } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { PasswordInput } from "@/modules/auth/components";

export type ResetPasswordFormValues = {
  password: string;
};

type ResetPasswordFormProps = {
  errorMessage?: string;
  isSubmitting?: boolean;
  onSubmit: (values: ResetPasswordFormValues) => void;
};

export function ResetPasswordForm({
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const [mismatchError, setMismatchError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setMismatchError(t("profile.passwordMismatch"));
      return;
    }

    setMismatchError(undefined);
    onSubmit({ password });
  }

  const alertMessage = mismatchError ?? errorMessage;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <PasswordInput
        name="password"
        label={t("profile.newPassword")}
        autoComplete="new-password"
      />

      <PasswordInput
        name="confirmPassword"
        label={t("profile.confirmNewPassword")}
        autoComplete="new-password"
      />

      {alertMessage ? (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {alertMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 w-full cursor-pointer rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t("resetPassword.submitting") : t("resetPassword.submit")}
      </button>

      <p className="text-center text-sm">
        <a
          href="/login"
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 font-medium text-primary hover:text-primary-dark hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("resetPassword.backToLogin")}
        </a>
      </p>
    </form>
  );
}
