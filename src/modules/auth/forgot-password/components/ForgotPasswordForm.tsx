"use client";

import { ArrowLeft, Mail } from "lucide-react";
import { type FormEvent, useId } from "react";
import { useTranslation } from "react-i18next";

export type ForgotPasswordFormValues = {
  email: string;
};

type ForgotPasswordFormProps = {
  errorMessage?: string;
  successMessage?: string;
  isSubmitting?: boolean;
  onSubmit: (values: ForgotPasswordFormValues) => void;
};

export function ForgotPasswordForm({
  errorMessage,
  successMessage,
  isSubmitting = false,
  onSubmit,
}: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const emailId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    onSubmit({
      email: String(data.get("email") ?? ""),
    });
  }

  if (successMessage) {
    return (
      <div className="flex flex-col gap-4">
        <p
          className="rounded-md bg-success/10 px-3 py-2 text-sm text-success"
          role="status"
        >
          {successMessage}
        </p>
        <a
          href="/login"
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("forgotPassword.backToLogin")}
        </a>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5 text-sm">
        <label htmlFor={emailId} className="font-medium text-text-main">
          {t("login.email")}
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary"
            aria-hidden
          />
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={t("login.emailPlaceholder")}
            className="w-full rounded-md border border-border bg-background py-2.5 pr-3 pl-10 text-text-main outline-none ring-ring placeholder:text-text-secondary focus:ring-2"
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 w-full cursor-pointer rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
      </button>

      <p className="text-center text-sm">
        <a
          href="/login"
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 font-medium text-primary hover:text-primary-dark hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("forgotPassword.backToLogin")}
        </a>
      </p>
    </form>
  );
}
