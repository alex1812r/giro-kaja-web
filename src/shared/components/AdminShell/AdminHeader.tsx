"use client";

import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AuthUser } from "@/modules/auth/types";
import { ProfileMenu } from "@/shared/components/AppShell/ProfileMenu";

type AdminHeaderProps = {
  user: AuthUser;
  onOpenMenu: () => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
};

export function AdminHeader({
  user,
  onOpenMenu,
  onSignOut,
  isSigningOut,
}: AdminHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMenu}
          className="cursor-pointer rounded-full p-2 text-text-secondary hover:bg-surface-muted hover:text-primary md:hidden"
          aria-label={t("shell.openMenu")}
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </div>

      <ProfileMenu
        user={user}
        onSignOut={onSignOut}
        isSigningOut={isSigningOut}
      />
    </header>
  );
}
