"use client";

import { useTranslation } from "react-i18next";

import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

export function NotificationsPage() {
  const { t } = useTranslation();

  return (
    <ModulePlaceholder
      title={t("notifications.title")}
      description={t("shell.moduleUnderConstruction")}
    />
  );
}
