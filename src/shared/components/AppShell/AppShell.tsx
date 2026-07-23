"use client";

import { type ReactNode, useMemo, useState } from "react";

import type { AuthUser } from "@/modules/auth/types";
import { isViewerRole } from "@/modules/auth/types";
import { CurrencyProvider } from "@/shared/currency";

import { getNavItemsForRole } from "./appShellNav";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileNavDrawer } from "./MobileNavDrawer";

type AppShellProps = {
  children: ReactNode;
  currentPath: string;
  user: AuthUser;
  onSignOut: () => void;
  isSigningOut?: boolean;
};

export function AppShell({
  children,
  currentPath,
  user,
  onSignOut,
  isSigningOut,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = useMemo(() => getNavItemsForRole(user.role), [user.role]);
  const isViewer = isViewerRole(user.role);

  return (
    <CurrencyProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-text-main">
        {!isViewer ? (
          <AppSidebar currentPath={currentPath} items={navItems} />
        ) : null}
        <MobileNavDrawer
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          currentPath={currentPath}
          items={navItems}
        />

        <div
          className={
            isViewer
              ? "flex min-h-0 min-w-0 flex-1 flex-col"
              : "flex min-h-0 min-w-0 flex-1 flex-col md:pl-sidebar"
          }
        >
          <AppHeader
            user={user}
            onOpenMenu={() => setMobileNavOpen(true)}
            onSignOut={onSignOut}
            isSigningOut={isSigningOut}
            compact={isViewer}
          />
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </CurrencyProvider>
  );
}
