"use client";

import { Landmark, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AuthUser } from "@/modules/auth/types";

import { CurrencySelector } from "./CurrencySelector";
import { HeaderClock } from "./HeaderClock";
import { NotificationsMenu } from "./NotificationsMenu";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { ProfileMenu } from "./ProfileMenu";

type AppHeaderProps = {
  user: AuthUser;
  onOpenMenu: () => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
  /** Viewer shell: brand in header, no notifications / desktop clock clutter */
  compact?: boolean;
};

export function AppHeader({
  user,
  onOpenMenu,
  onSignOut,
  isSigningOut,
  compact = false,
}: AppHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-surface px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 justify-self-start">
        {!compact ? (
          <button
            type="button"
            onClick={onOpenMenu}
            className="cursor-pointer rounded-full p-2 text-text-secondary hover:bg-surface-muted hover:text-primary md:hidden"
            aria-label={t("shell.openMenu")}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        ) : null}

        {compact ? (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <Landmark className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate font-headline text-sm font-bold text-primary">
                {t("brand.name")}
              </p>
              <p className="truncate text-xs text-text-secondary">
                {t("shell.viewerSubtitle")}
              </p>
            </div>
          </div>
        ) : (
          <HeaderClock />
        )}
      </div>

      <div className="justify-self-center px-2">
        <OrganizationSwitcher user={user} />
      </div>

      <div className="flex items-center gap-2 justify-self-end sm:gap-3">
        <CurrencySelector />
        {!compact ? <NotificationsMenu /> : null}
        <ProfileMenu
          user={user}
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    </header>
  );
}
