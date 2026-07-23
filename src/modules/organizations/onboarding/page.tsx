"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { AuthCard, AuthPageShell } from "@/modules/auth/components";
import { needsOrganizationSetup } from "@/modules/auth/roleAccess";
import { redirectPathIfNeeded } from "@/modules/auth/redirectIfNeeded";
import { useCurrentUser, useLogout } from "@/modules/auth/hooks";
import { ClientApiError } from "@/shared/api/apiFetch";
import { LoadingState } from "@/shared/components/LoadingState";

import { CreateOrganizationForm } from "./components/CreateOrganizationForm";
import { useCreateOrganization } from "./hooks/useCreateOrganization";

export function CreateOrganizationOnboardingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const createOrg = useCreateOrganization();
  const user = currentUser.data?.user;
  const userId = user?.id;
  const systemRole = user?.systemRole;
  const orgId = user?.organization?.id;

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
    const destination = redirectPathIfNeeded("/onboarding/organization", user);
    if (destination) {
      router.replace(destination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [router, userId, systemRole, orgId]);

  if (currentUser.isLoading) {
    return <LoadingState title={t("shell.loadingSession")} />;
  }

  if (!user || !needsOrganizationSetup(user)) {
    return <LoadingState title={t("shell.loadingSession")} />;
  }

  return (
    <AuthPageShell>
      <AuthCard
        heading={t("onboardingOrg.heading")}
        description={t("onboardingOrg.description")}
        footer={
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-xs font-medium text-text-secondary hover:text-primary"
          >
            {logout.isPending ? t("shell.signingOut") : t("auth.logout")}
          </button>
        }
      >
        <CreateOrganizationForm
          isSubmitting={createOrg.isPending}
          errorMessage={
            createOrg.error instanceof ClientApiError
              ? createOrg.error.message
              : createOrg.error
                ? t("onboardingOrg.errorGeneric")
                : undefined
          }
          onSubmit={(values) => {
            createOrg.mutate(values);
          }}
        />
      </AuthCard>
    </AuthPageShell>
  );
}
