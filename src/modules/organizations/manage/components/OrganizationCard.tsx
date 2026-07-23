"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  AdminTableMenuItem,
  AdminTableRowMenu,
} from "@/modules/admin/components/AdminTableRowMenu";
import { useSwitchOrganization } from "@/modules/organizations/hooks/useSwitchOrganization";
import type { MyOrganizationItem } from "@/modules/organizations/types";
import { cn } from "@/shared/utils/cn";

type OrganizationCardProps = {
  organization: MyOrganizationItem;
  busy?: boolean;
  onDelete: (organization: MyOrganizationItem) => void;
};

export function OrganizationCard({
  organization,
  busy = false,
  onDelete,
}: OrganizationCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const switchOrg = useSwitchOrganization();
  const hasActions = !organization.isActive || organization.canDelete;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => {
        router.push(`/organizations/${organization.id}`);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/organizations/${organization.id}`);
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm",
        "transition-[border-color,box-shadow,transform] duration-200",
        "hover:border-primary hover:shadow-md hover:-translate-y-0.5",
        organization.isActive && "border-primary/50 ring-1 ring-primary/20",
        organization.isActive && "hover:border-primary hover:ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            <Building2 className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="truncate font-headline text-lg font-semibold text-text-main">
              {organization.name}
            </h2>
            <p className="text-xs text-text-secondary">
              {t("myOrganizations.roleLabel", { role: organization.role })}
              {" · "}
              {t("myOrganizations.membersCount", {
                count: organization.memberCount,
              })}
            </p>
          </div>
        </div>

        {hasActions ? (
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
            }}
          >
            <AdminTableRowMenu>
              {({ close }) => (
                <>
                  {!organization.isActive ? (
                    <AdminTableMenuItem
                      disabled={busy || switchOrg.isPending}
                      onSelect={() => {
                        close();
                        void switchOrg.mutateAsync(organization.id);
                      }}
                    >
                      {t("myOrganizations.switchTo")}
                    </AdminTableMenuItem>
                  ) : null}
                  {organization.canDelete ? (
                    <AdminTableMenuItem
                      danger
                      disabled={busy}
                      onSelect={() => {
                        close();
                        onDelete(organization);
                      }}
                    >
                      {t("myOrganizations.deleteAction")}
                    </AdminTableMenuItem>
                  ) : null}
                </>
              )}
            </AdminTableRowMenu>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {organization.isActive ? (
          <span className="inline-flex rounded-md bg-primary-container px-2 py-0.5 text-xs font-medium text-on-primary-container">
            {t("myOrganizations.activeBadge")}
          </span>
        ) : (
          <span className="inline-flex rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
            {t("myOrganizations.inactiveBadge")}
          </span>
        )}
        <span className="text-xs text-text-secondary">
          {t("myOrganizations.createdAt", {
            date: organization.createdAt.slice(0, 10),
          })}
        </span>
      </div>
    </article>
  );
}
