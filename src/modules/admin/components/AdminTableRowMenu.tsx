"use client";

import { MoreVertical } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { PortalMenu } from "@/shared/components/PortalMenu";
import { cn } from "@/shared/utils/cn";

type AdminTableRowMenuProps = {
  children: (args: { close: () => void }) => ReactNode;
  disabled?: boolean;
};

export function AdminTableRowMenu({
  children,
  disabled = false,
}: AdminTableRowMenuProps) {
  const { t } = useTranslation();

  if (disabled) {
    return (
      <span className="inline-flex size-8 items-center justify-center text-text-secondary/40">
        <MoreVertical className="size-4" aria-hidden />
      </span>
    );
  }

  return (
    <PortalMenu
      align="end"
      widthClassName="w-48"
      trigger={({ open, toggle, triggerProps }) => (
        <button
          type="button"
          {...triggerProps}
          onClick={toggle}
          className={cn(
            "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors",
            "hover:bg-surface-muted hover:text-text-main",
            open && "bg-surface-muted text-text-main",
          )}
          aria-label={t("admin.rowActions")}
        >
          <MoreVertical className="size-4" aria-hidden />
        </button>
      )}
    >
      {({ close }) => (
        <div className="py-1">{children({ close })}</div>
      )}
    </PortalMenu>
  );
}

type AdminTableMenuItemProps = {
  children: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
};

export function AdminTableMenuItem({
  children,
  onSelect,
  danger = false,
  disabled = false,
}: AdminTableMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm transition-colors",
        "hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50",
        danger ? "text-danger hover:bg-danger/10" : "text-text-main",
      )}
    >
      {children}
    </button>
  );
}
