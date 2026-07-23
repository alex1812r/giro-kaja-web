"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AdminTableMenuItem,
  AdminTableRowMenu,
} from "@/modules/admin/components/AdminTableRowMenu";
import type { AdminOrganizationListItem } from "@/modules/admin/types";
import { ClientApiError } from "@/shared/api/apiFetch";
import { ErrorState } from "@/shared/components/ErrorState";

import { ConfirmDeleteOrganizationModal } from "./components/ConfirmDeleteOrganizationModal";
import { AdminOrganizationsPageSkeleton } from "./components/AdminOrganizationsPageSkeleton";
import {
  useAdminOrganizations,
  useDeleteAdminOrganization,
} from "./hooks/useAdminOrganizations";

export function AdminOrganizationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: orgs, isLoading, isError, error, refetch } =
    useAdminOrganizations();
  const deleteOrg = useDeleteAdminOrganization();
  const [deleteTarget, setDeleteTarget] =
    useState<AdminOrganizationListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return <AdminOrganizationsPageSkeleton />;
  }

  if (isError || !orgs) {
    return (
      <ErrorState
        title={t("admin.orgsTitle")}
        description={
          error instanceof Error
            ? error.message
            : t("shell.moduleUnderConstruction")
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-headline text-2xl font-semibold text-text-main">
          {t("admin.orgsTitle")}
        </h1>
        <p className="text-sm text-text-secondary">{t("admin.orgsSubtitle")}</p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-border text-xs text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.colOrgName")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colMembers")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colCreated")}</th>
              <th className="w-14 px-4 py-3 font-medium">
                <span className="sr-only">{t("admin.colActions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-text-secondary"
                >
                  {t("admin.noOrgs")}
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr
                  key={org.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-text-main">
                    {org.name}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {org.memberCount}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {org.createdAt.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminTableRowMenu>
                      {({ close }) => (
                        <>
                          <AdminTableMenuItem
                            onSelect={() => {
                              close();
                              router.push(`/admin/organizations/${org.id}`);
                            }}
                          >
                            {t("admin.viewDetail")}
                          </AdminTableMenuItem>
                          <AdminTableMenuItem
                            danger
                            disabled={deleteOrg.isPending}
                            onSelect={() => {
                              close();
                              setDeleteError(null);
                              setDeleteTarget(org);
                            }}
                          >
                            {t("admin.deleteOrganization")}
                          </AdminTableMenuItem>
                        </>
                      )}
                    </AdminTableRowMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteOrganizationModal
        organizationName={deleteTarget?.name ?? ""}
        open={Boolean(deleteTarget)}
        isPending={deleteOrg.isPending}
        errorMessage={deleteError}
        onClose={() => {
          if (!deleteOrg.isPending) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }
          setDeleteError(null);
          void deleteOrg
            .mutateAsync(deleteTarget.id)
            .then(() => {
              setDeleteTarget(null);
            })
            .catch((err: unknown) => {
              setDeleteError(
                err instanceof ClientApiError
                  ? err.message
                  : err instanceof Error
                    ? err.message
                    : t("admin.deleteOrgFailed"),
              );
            });
        }}
      />
    </div>
  );
}
