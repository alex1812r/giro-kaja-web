import {
  Building2,
  Home,
  Landmark,
  Settings,
  Wallet,
  Banknote,
  type LucideIcon,
} from "lucide-react";

import {
  isViewerRole,
  type OrganizationRole,
} from "@/modules/auth/types";

export type AppNavItem = {
  href: string;
  icon: LucideIcon;
  /** i18n key, e.g. tabs.home */
  labelKey: string;
};

/** Sidebar navigation (Stitch Dashboard). Routes in English; labels via i18n. */
export const appNavItems: AppNavItem[] = [
  { href: "/", icon: Home, labelKey: "tabs.home" },
  { href: "/loans", icon: Banknote, labelKey: "tabs.loans" },
  { href: "/debts", icon: Wallet, labelKey: "tabs.debts" },
  { href: "/cash-register", icon: Landmark, labelKey: "tabs.caja" },
  { href: "/organizations", icon: Building2, labelKey: "tabs.organizations" },
  { href: "/settings", icon: Settings, labelKey: "tabs.settings" },
];

/** Viewer: loans only (no home/debts/caja/settings). */
export const viewerNavItems: AppNavItem[] = [
  { href: "/loans", icon: Banknote, labelKey: "tabs.loans" },
];

export function getNavItemsForRole(role: OrganizationRole): AppNavItem[] {
  if (isViewerRole(role)) {
    return viewerNavItems;
  }
  return appNavItems;
}

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
