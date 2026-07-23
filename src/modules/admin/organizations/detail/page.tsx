"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AdminTableMenuItem,
  AdminTableRowMenu,
} from "@/modules/admin/components/AdminTableRowMenu";
import { ClientApiError } from "@/shared/api/apiFetch";
import { ErrorState } from "@/shared/components/ErrorState";

import { ConfirmDeleteOrganizationModal } from "../components/ConfirmDeleteOrganizationModal";
import {
  useAdminOrganizationDetail,
  useDeleteAdminOrganization,
} from "../hooks/useAdminOrganizations";
import { AdminOrganizationDetailSkeleton } from "./components/AdminOrganizationDetailSkeleton";

export function AdminOrganizationDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : undefined;
  const { data, isLoading, isError, error, refetch } =
    useAdminOrganizationDetail(id);
  const deleteOrg = useDeleteAdminOrganization();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return <AdminOrganizationDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("admin.orgDetailTitle")}
        description={
          error instanceof Error ? error.message : t("admin.orgNotFound")
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <Link
        href="/admin/organizations"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("admin.backToOrgs")}
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {data.name}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("admin.orgDetailSubtitle")}
          </p>
        </div>
        <AdminTableRowMenu>
          {({ close }) => (
            <AdminTableMenuItem
              danger
              disabled={deleteOrg.isPending}
              onSelect={() => {
                close();
                setDeleteError(null);
                setConfirmOpen(true);
              }}
            >
              {t("admin.deleteOrganization")}
            </AdminTableMenuItem>
          )}
        </AdminTableRowMenu>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">{t("admin.colMembers")}</p>
          <p className="mt-1 font-headline text-xl font-semibold">
            {data.memberCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">{t("admin.loanCount")}</p>
          <p className="mt-1 font-headline text-xl font-semibold">
            {data.loanCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">{t("admin.debtCount")}</p>
          <p className="mt-1 font-headline text-xl font-semibold">
            {data.debtCount}
          </p>
        </div>
      </div>

      <section className="overflow-x-auto rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 font-headline text-sm font-semibold">
          {t("admin.membersTitle")}
        </h2>
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-border text-xs text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.colName")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colEmail")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colOrgRole")}</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((member) => (
              <tr
                key={member.userId}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium text-text-main">
                  {member.name}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {member.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <ConfirmDeleteOrganizationModal
        organizationName={data.name}
        open={confirmOpen}
        isPending={deleteOrg.isPending}
        errorMessage={deleteError}
        onClose={() => {
          if (!deleteOrg.isPending) {
            setConfirmOpen(false);
            setDeleteError(null);
          }
        }}
        onConfirm={() => {
          setDeleteError(null);
          void deleteOrg
            .mutateAsync(data.id)
            .then(() => {
              setConfirmOpen(false);
              router.replace("/admin/organizations");
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
