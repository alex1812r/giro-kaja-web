"use client";

import { useTranslation } from "react-i18next";

import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

export function ProfilePage() {
  const { t } = useTranslation();

  return (
    <ModulePlaceholder
      title={t("profile.title")}
      description={t("shell.moduleUnderConstruction")}
    />
  );
}
