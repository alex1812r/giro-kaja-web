"use client";

import { useTranslation } from "react-i18next";

import { SettingsPreferencesForm } from "./components/SettingsPreferencesForm";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-headline text-2xl font-semibold text-text-main">
          {t("tabs.settings")}
        </h1>
        <p className="text-sm text-text-secondary">
          {t("settings.appearanceSubtitle")}
        </p>
      </header>

      <SettingsPreferencesForm />
    </div>
  );
}
