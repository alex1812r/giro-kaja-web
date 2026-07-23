"use client";

import { ArrowLeft, Banknote, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { MetricCard } from "@/modules/home/components/MetricCard";
import type { MyOrganizationMember } from "@/modules/organizations/types";
import { ClientApiError } from "@/shared/api/apiFetch";
import { ErrorState } from "@/shared/components/ErrorState";
import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import { useDeleteOrganizationMember } from "../hooks/useOrganizationMembers";
import { useMyOrganizationDetail } from "../hooks/useMyOrganizations";
import { ConfirmDeleteOrganizationMemberModal } from "./components/ConfirmDeleteOrganizationMemberModal";
import { CreateOrganizationMemberModal } from "./components/CreateOrganizationMemberModal";
import { EditOrganizationMemberModal } from "./components/EditOrganizationMemberModal";
import { OrganizationDetailSkeleton } from "./components/OrganizationDetailSkeleton";

export function OrganizationDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : undefined;
  const { currency } = useCurrency();
  const { data, isLoading, isError, error, refetch } = useMyOrganizationDetail(
    id,
    currency,
  );
  const deleteMember = useDeleteOrganizationMember();
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<MyOrganizationMember | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<MyOrganizationMember | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return <OrganizationDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("myOrganizations.detailTitle")}
        description={
          error instanceof Error
            ? error.message
            : t("myOrganizations.detailNotFound")
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
        href="/organizations"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("myOrganizations.backToList")}
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {data.name}
          </h1>
          {data.isActive ? (
            <span className="inline-flex rounded-md bg-primary-container px-2 py-0.5 text-xs font-medium text-on-primary-container">
              {t("myOrganizations.activeBadge")}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-text-secondary">
          {t("myOrganizations.roleLabel", { role: data.role })}
          {" · "}
          {t("myOrganizations.createdAt", {
            date: data.createdAt.slice(0, 10),
          })}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          label={t("myOrganizations.totalLent")}
          value={formatMoney(data.totalLent, data.currency)}
          icon={Banknote}
        />
        <MetricCard
          label={t("myOrganizations.totalOwed")}
          value={formatMoney(data.totalOwed, data.currency)}
          icon={Wallet}
          tone="danger"
        />
      </div>

      <section className="overflow-x-auto rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="font-headline text-sm font-semibold">
            {t("myOrganizations.membersTitle")}
          </h2>
          {data.canManageMembers ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-medium text-on-primary",
                "hover:bg-primary-dark",
              )}
            >
              <Plus className="size-3.5" aria-hidden />
              {t("myOrganizations.memberCreateAction")}
            </button>
          ) : null}
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">
                {t("myOrganizations.colName")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("myOrganizations.colEmail")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("myOrganizations.colRole")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("myOrganizations.colAccess")}
              </th>
              {data.canManageMembers ? (
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">{t("common.actions")}</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {data.members.map((member) => {
              const canManage =
                data.canManageMembers &&
                (member.role === "admin" || member.role === "viewer");

              return (
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
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {member.role === "viewer"
                      ? member.shareAllLoans
                        ? t("myOrganizations.accessAllLoans")
                        : t("myOrganizations.accessLoanCount", {
                            count: member.sharedLoanCount,
                          })
                      : t("myOrganizations.accessFull")}
                  </td>
                  {data.canManageMembers ? (
                    <td className="px-4 py-3">
                      {canManage ? (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditMember(member)}
                            className="inline-flex size-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted hover:text-primary"
                            aria-label={t("myOrganizations.memberEditAction")}
                            title={t("myOrganizations.memberEditAction")}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(member);
                            }}
                            className="inline-flex size-8 items-center justify-center rounded-md text-text-secondary hover:bg-danger/10 hover:text-danger"
                            aria-label={t("myOrganizations.memberDeleteAction")}
                            title={t("myOrganizations.memberDeleteAction")}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {data.canManageMembers && id ? (
        <>
          <CreateOrganizationMemberModal
            organizationId={id}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={() => {
              void refetch();
            }}
          />
          <EditOrganizationMemberModal
            organizationId={id}
            member={editMember}
            open={Boolean(editMember)}
            onClose={() => setEditMember(null)}
            onUpdated={() => {
              void refetch();
            }}
          />
          <ConfirmDeleteOrganizationMemberModal
            member={deleteTarget}
            open={Boolean(deleteTarget)}
            isPending={deleteMember.isPending}
            errorMessage={deleteError}
            onClose={() => {
              if (!deleteMember.isPending) {
                setDeleteTarget(null);
                setDeleteError(null);
              }
            }}
            onConfirm={() => {
              if (!deleteTarget || !id) {
                return;
              }
              setDeleteError(null);
              void deleteMember
                .mutateAsync({
                  organizationId: id,
                  userId: deleteTarget.userId,
                })
                .then(() => {
                  setDeleteTarget(null);
                  void refetch();
                })
                .catch((err: unknown) => {
                  setDeleteError(
                    err instanceof ClientApiError
                      ? err.message
                      : err instanceof Error
                        ? err.message
                        : t("myOrganizations.memberDeleteFailed"),
                  );
                });
            }}
          />
        </>
      ) : null}
    </div>
  );
}
