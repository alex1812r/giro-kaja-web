"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useCurrentUser, useLogout } from "@/modules/auth/hooks";
import { redirectPathIfNeeded } from "@/modules/auth/redirectIfNeeded";
import { ClientApiError } from "@/shared/api/apiFetch";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";

import { AppShell } from "./AppShell";

type AuthenticatedAppShellProps = {
  children: ReactNode;
};

export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const user = currentUser.data?.user;
  const userId = user?.id;
  const systemRole = user?.systemRole;
  const orgId = user?.organization?.id;
  const role = user?.role;

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
  }, [pathname, router, userId, systemRole, orgId, role]);

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

  if (!user || redirectPathIfNeeded(pathname, user)) {
    return <LoadingState title={t("shell.loadingSession")} />;
  }

  return (
    <AppShell
      currentPath={pathname}
      user={user}
      onSignOut={() => logout.mutate()}
      isSigningOut={logout.isPending}
    >
      {children}
    </AppShell>
  );
}
