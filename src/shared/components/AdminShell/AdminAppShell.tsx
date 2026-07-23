"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useCurrentUser, useLogout } from "@/modules/auth/hooks";
import { redirectPathIfNeeded } from "@/modules/auth/redirectIfNeeded";
import { isSuperadmin } from "@/modules/auth/types";
import { ClientApiError } from "@/shared/api/apiFetch";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";

import { AdminHeader } from "./AdminHeader";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminSidebar } from "./AdminSidebar";

type AdminAppShellProps = {
  children: ReactNode;
};

export function AdminAppShell({ children }: AdminAppShellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const user = currentUser.data?.user;
  const userId = user?.id;
  const systemRole = user?.systemRole;

  useEffect(() => {
    if (
      currentUser.error instanceof ClientApiError &&
      currentUser.error.status === 401
    ) {
      router.replace("/login");
    }
  }, [currentUser.error, router]);

  useEffect(() => {
    if (!user || !userId) {
      return;
    }

    const destination = redirectPathIfNeeded(pathname, user);
    if (destination) {
      router.replace(destination);
    }
    // Primitive session fields only — avoid loops when `user` gets a new object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [pathname, router, userId, systemRole]);

  if (currentUser.isLoading) {
    return <LoadingState title={t("shell.loadingSession")} />;
  }

  if (currentUser.error) {
    if (
      currentUser.error instanceof ClientApiError &&
      currentUser.error.status === 401
    ) {
      return null;
    }

    return (
      <ErrorState
        title={t("shell.sessionErrorTitle")}
        description={currentUser.error.message}
        retryLabel={t("shell.retry")}
        onRetry={() => {
          void currentUser.refetch();
        }}
      />
    );
  }

  if (!user || !isSuperadmin(user) || redirectPathIfNeeded(pathname, user)) {
    return <LoadingState title={t("shell.loadingSession")} />;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-text-main">
      <AdminSidebar currentPath={pathname} />
      <AdminMobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        currentPath={pathname}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:pl-sidebar">
        <AdminHeader
          user={user}
          onOpenMenu={() => setMobileNavOpen(true)}
          onSignOut={() => logout.mutate()}
          isSigningOut={logout.isPending}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
