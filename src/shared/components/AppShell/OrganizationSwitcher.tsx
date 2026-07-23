"use client";

import { Building2, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import type { AuthUser } from "@/modules/auth/types";
import { useSwitchOrganization } from "@/modules/organizations/hooks/useSwitchOrganization";
import { PortalMenu } from "@/shared/components/PortalMenu";
import { cn } from "@/shared/utils/cn";

type OrganizationSwitcherProps = {
  user: AuthUser;
};

export function OrganizationSwitcher({ user }: OrganizationSwitcherProps) {
  const { t } = useTranslation();
  const switchOrg = useSwitchOrganization();
  const memberships = user.memberships ?? [];
  const activeId = user.organization?.id ?? null;
  const activeName = user.organization?.name ?? t("shell.noOrganization");

  if (memberships.length === 0 || !user.organization) {
    return null;
  }

  return (
    <PortalMenu
      widthClassName="w-64"
      align="end"
      trigger={({ open, toggle, triggerProps }) => (
        <button
          type="button"
          {...triggerProps}
          onClick={toggle}
          disabled={switchOrg.isPending}
          className={cn(
            "inline-flex max-w-[min(100%,16rem)] cursor-pointer items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5",
            "hover:border-primary/40 hover:text-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
            open && "border-primary/40 text-primary",
          )}
          aria-label={t("shell.selectOrganization")}
          title={activeName}
        >
          <Building2 className="size-4 shrink-0 text-text-secondary" aria-hidden />
          <span className="truncate text-sm font-semibold text-text-main">
            {switchOrg.isPending ? t("shell.switchingOrganization") : activeName}
          </span>
          <ChevronDown className="size-4 shrink-0 text-text-secondary" aria-hidden />
        </button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col">
          <ul className="py-1" role="none">
            <li className="px-3 py-2 text-xs font-medium text-text-secondary">
              {t("shell.organizations")}
            </li>
            {memberships.map((membership) => {
              const selected = membership.organization.id === activeId;

              return (
                <li key={membership.organization.id} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    disabled={switchOrg.isPending || selected}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm",
                      selected
                        ? "bg-primary-light font-medium text-primary"
                        : "text-text-main hover:bg-surface-muted",
                      "disabled:cursor-default",
                    )}
                    onClick={() => {
                      if (selected) {
                        close();
                        return;
                      }
                      close();
                      void switchOrg.mutateAsync(membership.organization.id);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {membership.organization.name}
                    </span>
                    <span className="shrink-0 text-xs text-text-secondary">
                      {membership.role}
                    </span>
                    {selected ? (
                      <Check className="size-4 shrink-0 text-primary" aria-hidden />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border p-1">
            <Link
              href="/organizations"
              role="menuitem"
              onClick={close}
              className="flex w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm text-primary hover:bg-surface-muted"
            >
              {t("shell.manageOrganizations")}
            </Link>
          </div>
        </div>
      )}
    </PortalMenu>
  );
}
