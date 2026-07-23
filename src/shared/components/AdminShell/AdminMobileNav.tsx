"use client";

import { Landmark, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/utils/cn";

import { adminNavItems, isAdminNavActive } from "./adminNav";

type AdminMobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPath: string;
};

export function AdminMobileNav({
  open,
  onOpenChange,
  currentPath,
}: AdminMobileNavProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (typeof document === "undefined" || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label={t("shell.closeMenu")}
        onClick={() => onOpenChange(false)}
      />
      <aside className="absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col bg-background p-4 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <Landmark className="size-5" aria-hidden />
            </div>
            <div>
              <p className="font-headline text-lg leading-none font-bold text-primary">
                {t("brand.name")}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {t("admin.systemSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
            aria-label={t("shell.close")}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isAdminNavActive(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                  active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-text-secondary hover:bg-surface-muted",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>,
    document.body,
  );
}
