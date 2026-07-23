"use client";

import { Mail } from "lucide-react";
import { type FormEvent, useId } from "react";
import { useTranslation } from "react-i18next";

import { PasswordInput } from "@/modules/auth/components";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginFormProps = {
  errorMessage?: string;
  isSubmitting?: boolean;
  onSubmit: (values: LoginFormValues) => void;
};

/**
 * Formulario presentacional de login (Stitch).
 */
export function LoginForm({
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: LoginFormProps) {
  const { t } = useTranslation();
  const emailId = useId();
  const rememberId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    onSubmit({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      remember: data.get("remember") === "on",
    });
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

      <PasswordInput
        name="password"
        label={t("login.password")}
        autoComplete="current-password"
      />

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          id={rememberId}
          name="remember"
          type="checkbox"
          className="size-4 cursor-pointer rounded border-border text-primary focus:ring-ring"
        />
        <label htmlFor={rememberId} className="cursor-pointer">
          {t("login.rememberMe")}
        </label>
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
        {isSubmitting ? t("login.submitting") : t("login.submit")}
      </button>

      <p className="text-center text-sm">
        <a
          href="/forgot-password"
          className="cursor-pointer font-medium text-primary hover:text-primary-dark hover:underline"
        >
          {t("login.forgotPasswordLink")}
        </a>
      </p>
    </form>
  );
}
