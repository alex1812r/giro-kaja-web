"use client";

import { Landmark } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/utils/cn";

import { adminNavItems, isAdminNavActive } from "./adminNav";

type AdminSidebarProps = {
  currentPath: string;
};

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
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
            {t("admin.systemSubtitle")}
          </p>
        </div>
      </div>

      <nav aria-label={t("shell.mainNav")} className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isAdminNavActive(currentPath, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-container text-on-primary-container"
                      : "text-text-secondary hover:bg-surface-muted hover:text-text-main",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
