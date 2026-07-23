"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { PortalMenu } from "@/shared/components/PortalMenu";
import { cn } from "@/shared/utils/cn";

import { mockRecentNotifications } from "./mockNotifications";

export function NotificationsMenu() {
  const { t } = useTranslation();
  const unreadCount = mockRecentNotifications.filter((item) => !item.read).length;

  return (
    <PortalMenu
      widthClassName="w-80"
      trigger={({ open, toggle, triggerProps }) => (
        <button
          type="button"
          {...triggerProps}
          onClick={toggle}
          className={cn(
            "relative cursor-pointer rounded-full p-2 text-text-secondary transition-colors",
            "hover:bg-surface-muted hover:text-primary",
            open && "bg-surface-muted text-primary",
          )}
          aria-label={t("notifications.title")}
        >
          <Bell className="size-5" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" />
          ) : null}
        </button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col">
          <div className="border-b border-border px-4 py-3">
            <p className="font-headline text-sm font-semibold text-text-main">
              {t("notifications.title")}
            </p>
          </div>

          <ul className="max-h-80 overflow-y-auto py-1">
            {mockRecentNotifications.map((item) => (
              <li key={item.id}>
                <div
                  className={cn(
                    "flex gap-3 px-4 py-3",
                    !item.read && "bg-primary-light/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      item.read ? "bg-border" : "bg-primary",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-main">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                      {item.body}
                    </p>
                    <p className="mt-1 text-[11px] text-text-secondary">
                      {item.createdAt}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-border px-4 py-3 text-center">
            <Link
              href="/notifications"
              onClick={close}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("shell.viewAllNotifications")}
            </Link>
          </div>
        </div>
      )}
    </PortalMenu>
  );
}
