"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import type { AuthUser } from "@/modules/auth/types";
import { isSuperadmin, isViewerRole } from "@/modules/auth/types";
import { PortalMenu } from "@/shared/components/PortalMenu";
import { cn } from "@/shared/utils/cn";

type ProfileMenuProps = {
  user: AuthUser;
  onSignOut: () => void;
  isSigningOut?: boolean;
};

export function ProfileMenu({
  user,
  onSignOut,
  isSigningOut = false,
}: ProfileMenuProps) {
  const { t } = useTranslation();
  const hideProfileLink = isViewerRole(user.role) || isSuperadmin(user);

  return (
    <PortalMenu
      widthClassName="w-72"
      trigger={({ open, toggle, triggerProps }) => (
        <button
          type="button"
          {...triggerProps}
          onClick={toggle}
          className={cn(
            "cursor-pointer rounded-full p-2 text-text-secondary transition-colors",
            "hover:bg-surface-muted hover:text-primary",
            open && "bg-surface-muted text-primary",
          )}
          aria-label={t("profile.title")}
        >
          <UserRound className="size-5" aria-hidden />
        </button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col">
          <div className="border-b border-border px-4 py-3">
            <p className="font-headline text-sm font-semibold text-text-main">
              {user.name}
            </p>
            {user.email ? (
              <p className="mt-0.5 truncate text-xs text-text-secondary">
                {user.email}
              </p>
            ) : null}
            {user.phone ? (
              <p className="mt-0.5 text-xs text-text-secondary">{user.phone}</p>
            ) : null}
            {user.organization ? (
              <p className="mt-1 truncate text-xs text-text-secondary">
                {user.organization.name}
                {" · "}
                {user.role}
              </p>
            ) : null}
          </div>

          {!hideProfileLink ? (
            <div className="py-1">
              <Link
                href="/profile"
                role="menuitem"
                onClick={close}
                className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-surface-muted"
              >
                {t("shell.viewProfile")}
              </Link>
            </div>
          ) : null}

          <div className="border-t border-border p-2">
            <button
              type="button"
              role="menuitem"
              disabled={isSigningOut}
              onClick={() => {
                close();
                onSignOut();
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="size-4" aria-hidden />
              {isSigningOut ? t("shell.signingOut") : t("auth.logout")}
            </button>
          </div>
        </div>
      )}
    </PortalMenu>
  );
}
