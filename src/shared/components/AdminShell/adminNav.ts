import { Building2, Users, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/users", icon: Users, labelKey: "tabs.adminUsers" },
  {
    href: "/admin/organizations",
    icon: Building2,
    labelKey: "tabs.adminOrgs",
  },
];

export function isAdminNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
