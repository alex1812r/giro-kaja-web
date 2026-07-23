"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { MyOrganizationItem } from "@/modules/organizations/types";
import { ClientApiError } from "@/shared/api/apiFetch";
import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/utils/cn";

import { ConfirmDeleteMyOrganizationModal } from "./components/ConfirmDeleteMyOrganizationModal";
import { CreateOrganizationModal } from "./components/CreateOrganizationModal";
import { MyOrganizationsPageSkeleton } from "./components/MyOrganizationsPageSkeleton";
import { OrganizationCard } from "./components/OrganizationCard";
import {
  useCreateMyOrganization,
  useDeleteMyOrganization,
  useMyOrganizations,
} from "./hooks/useMyOrganizations";

export function MyOrganizationsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useMyOrganizations();
  const createOrg = useCreateMyOrganization();
  const deleteOrg = useDeleteMyOrganization();
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyOrganizationItem | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return <MyOrganizationsPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("myOrganizations.title")}
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

  const busy = createOrg.isPending || deleteOrg.isPending;

  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {t("myOrganizations.title")}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("myOrganizations.subtitle")}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setCreateError(null);
            setCreateOpen(true);
          }}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-on-primary",
            "transition-colors hover:bg-primary-dark disabled:opacity-50",
          )}
        >
          <Plus className="size-4" aria-hidden />
          {t("myOrganizations.createAction")}
        </button>
      </header>

      {data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">{t("myOrganizations.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              busy={busy}
              onDelete={(org) => {
                setDeleteError(null);
                setDeleteTarget(org);
              }}
            />
          ))}
        </div>
      )}

      <CreateOrganizationModal
        open={createOpen}
        isPending={createOrg.isPending}
        errorMessage={createError}
        onClose={() => {
          if (!createOrg.isPending) {
            setCreateOpen(false);
            setCreateError(null);
          }
        }}
        onSubmit={(values) => {
          setCreateError(null);
          void createOrg
            .mutateAsync(values.name)
            .then(() => {
              setCreateOpen(false);
            })
            .catch((err: unknown) => {
              setCreateError(
                err instanceof ClientApiError
                  ? err.message
                  : err instanceof Error
                    ? err.message
                    : t("myOrganizations.createFailed"),
              );
            });
        }}
      />

      <ConfirmDeleteMyOrganizationModal
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
                    : t("myOrganizations.deleteFailed"),
              );
            });
        }}
      />
    </div>
  );
}
