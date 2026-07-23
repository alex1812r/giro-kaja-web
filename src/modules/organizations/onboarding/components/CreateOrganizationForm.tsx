"use client";

import { Building2 } from "lucide-react";
import { type FormEvent, useId } from "react";
import { useTranslation } from "react-i18next";

export type CreateOrganizationFormValues = {
  name: string;
};

type CreateOrganizationFormProps = {
  errorMessage?: string;
  isSubmitting?: boolean;
  onSubmit: (values: CreateOrganizationFormValues) => void;
};

export function CreateOrganizationForm({
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: CreateOrganizationFormProps) {
  const { t } = useTranslation();
  const nameId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      name: String(data.get("name") ?? "").trim(),
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5 text-sm">
        <label htmlFor={nameId} className="font-medium text-text-main">
          {t("onboardingOrg.formName")}
        </label>
        <div className="relative">
          <Building2
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary"
            aria-hidden
          />
          <input
            id={nameId}
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="organization"
            disabled={isSubmitting}
            placeholder={t("onboardingOrg.formNamePlaceholder")}
            className="h-11 w-full rounded-md border border-border bg-surface py-2 pr-3 pl-10 text-sm text-text-main outline-none focus:border-primary"
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {isSubmitting
          ? t("onboardingOrg.submitting")
          : t("onboardingOrg.submit")}
      </button>
    </form>
  );
}
