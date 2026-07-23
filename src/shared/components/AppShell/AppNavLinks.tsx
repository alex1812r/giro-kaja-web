"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/utils/cn";

import { type AppNavItem, isNavItemActive } from "./appShellNav";

type AppNavLinksProps = {
  currentPath: string;
  items: readonly AppNavItem[];
  onNavigate?: () => void;
};

export function AppNavLinks({
  currentPath,
  items,
  onNavigate,
}: AppNavLinksProps) {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isNavItemActive(currentPath, item.href);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-primary-container font-semibold text-on-primary-container"
                  : "text-text-secondary hover:bg-surface-muted hover:text-primary",
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
              <span>{t(item.labelKey)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
