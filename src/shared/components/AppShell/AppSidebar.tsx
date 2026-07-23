"use client";

import { Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";

import { type AppNavItem } from "./appShellNav";
import { AppNavLinks } from "./AppNavLinks";

type AppSidebarProps = {
  currentPath: string;
  items: readonly AppNavItem[];
};

export function AppSidebar({ currentPath, items }: AppSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-sidebar flex-col border-r border-border bg-background p-4 md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Landmark className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-headline text-lg leading-none font-bold text-primary">
            {t("brand.name")}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {t("brand.adminSubtitle")}
          </p>
        </div>
      </div>

      <nav aria-label={t("shell.mainNav")} className="flex-1 overflow-y-auto">
        <AppNavLinks currentPath={currentPath} items={items} />
      </nav>
    </aside>
  );
}
