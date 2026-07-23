"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AdminTableMenuItem,
  AdminTableRowMenu,
} from "@/modules/admin/components/AdminTableRowMenu";
import type { AdminUserListItem } from "@/modules/admin/types";
import { useCurrentUser } from "@/modules/auth/hooks";
import { ClientApiError } from "@/shared/api/apiFetch";
import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/utils/cn";

import { AdminUsersPageSkeleton } from "./components/AdminUsersPageSkeleton";
import { ConfirmDeleteUserModal } from "./components/ConfirmDeleteUserModal";
import { ConfirmUserStatusModal } from "./components/ConfirmUserStatusModal";
import { CreateAdminUserModal } from "./components/CreateAdminUserModal";
import {
  useAdminUsers,
  useDeleteAdminUser,
  usePatchAdminUser,
} from "./hooks/useAdminUsers";

export function AdminUsersPage() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const sessionUserId = currentUser.data?.user.id;
  const { data: users, isLoading, isError, error, refetch } = useAdminUsers();
  const patchUser = usePatchAdminUser();
  const deleteUser = useDeleteAdminUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<AdminUserListItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return <AdminUsersPageSkeleton />;
  }

  if (isError || !users) {
    return (
      <ErrorState
        title={t("admin.usersTitle")}
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-semibold text-text-main">
            {t("admin.usersTitle")}
          </h1>
          <p className="text-sm text-text-secondary">{t("admin.usersSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-on-primary",
            "transition-colors hover:bg-primary-dark",
          )}
        >
          <Plus className="size-4" aria-hidden />
          {t("admin.createAdmin")}
        </button>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.colName")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colEmail")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colRole")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colOrgs")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.colStatus")}</th>
              <th className="w-14 px-4 py-3 font-medium">
                <span className="sr-only">{t("admin.colActions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = sessionUserId === user.id;
              const isSuperadmin = user.systemRole === "superadmin";
              const busy = patchUser.isPending || deleteUser.isPending;

              return (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-main">
                    {user.name}
                    {isSelf ? (
                      <span className="ml-2 text-xs font-normal text-text-secondary">
                        ({t("admin.youLabel")})
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {user.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {isSuperadmin
                      ? t("admin.roleSuperadmin")
                      : t("admin.roleTenant")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {user.memberships.length === 0
                      ? "—"
                      : user.memberships
                          .map((m) => `${m.organizationName} (${m.role})`)
                          .join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                        user.isActive
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-muted text-text-secondary",
                      )}
                    >
                      {user.isActive
                        ? t("admin.statusActive")
                        : t("admin.statusInactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminTableRowMenu disabled={isSelf}>
                      {({ close }) => (
                        <>
                          <AdminTableMenuItem
                            disabled={busy}
                            onSelect={() => {
                              close();
                              setStatusTarget(user);
                            }}
                          >
                            {user.isActive
                              ? t("admin.deactivate")
                              : t("admin.activate")}
                          </AdminTableMenuItem>
                          {!isSuperadmin ? (
                            <AdminTableMenuItem
                              danger
                              disabled={busy}
                              onSelect={() => {
                                close();
                                setDeleteError(null);
                                setDeleteTarget(user);
                              }}
                            >
                              {t("admin.deleteUser")}
                            </AdminTableMenuItem>
                          ) : null}
                        </>
                      )}
                    </AdminTableRowMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateAdminUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <ConfirmUserStatusModal
        user={statusTarget}
        open={Boolean(statusTarget)}
        isPending={patchUser.isPending}
        onClose={() => {
          if (!patchUser.isPending) {
            setStatusTarget(null);
          }
        }}
        onConfirm={() => {
          if (!statusTarget) {
            return;
          }
          void patchUser
            .mutateAsync({
              id: statusTarget.id,
              isActive: !statusTarget.isActive,
            })
            .then(() => {
              setStatusTarget(null);
            });
        }}
      />

      <ConfirmDeleteUserModal
        user={deleteTarget}
        open={Boolean(deleteTarget)}
        isPending={deleteUser.isPending}
        errorMessage={deleteError}
        onClose={() => {
          if (!deleteUser.isPending) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }
          setDeleteError(null);
          void deleteUser
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
                    : t("admin.deleteUserFailed"),
              );
            });
        }}
      />
    </div>
  );
}
