import {
  isOperatorRole,
  isSuperadmin,
  isViewerRole,
  type AuthUser,
  type OrganizationRole,
} from "./types";

function isAdminConsolePath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isOnboardingOrgPath(pathname: string): boolean {
  return (
    pathname === "/onboarding/organization" ||
    pathname.startsWith("/onboarding/organization/")
  );
}

/** Tenant operators without an organization must complete onboarding. */
export function needsOrganizationSetup(
  user: Pick<AuthUser, "systemRole" | "organization">,
): boolean {
  if (isSuperadmin(user)) {
    return false;
  }
  return !user.organization?.id;
}

/**
 * Path matrix:
 * - superadmin → only /admin/*
 * - no org (non-superadmin) → only /onboarding/organization
 * - viewer → /loans* (no /loans/new)
 * - owner/admin → app except /admin/* and onboarding
 */
export function isPathAllowedForUser(
  pathname: string,
  user: Pick<AuthUser, "role" | "systemRole" | "organization">,
): boolean {
  if (user.systemRole === "superadmin") {
    return isAdminConsolePath(pathname);
  }

  if (needsOrganizationSetup(user)) {
    return isOnboardingOrgPath(pathname);
  }

  if (isOnboardingOrgPath(pathname) || isAdminConsolePath(pathname)) {
    return false;
  }

  return isPathAllowedForOrgRole(pathname, user.role);
}

/** @deprecated prefer isPathAllowedForUser — kept for org-role-only checks */
export function isPathAllowedForRole(
  pathname: string,
  role: OrganizationRole,
): boolean {
  return isPathAllowedForOrgRole(pathname, role);
}

function isPathAllowedForOrgRole(
  pathname: string,
  role: OrganizationRole,
): boolean {
  if (isOperatorRole(role)) {
    return true;
  }

  if (!isViewerRole(role)) {
    return true;
  }

  if (pathname === "/loans" || pathname.startsWith("/loans/")) {
    if (pathname === "/loans/new" || pathname.startsWith("/loans/new/")) {
      return false;
    }
    return true;
  }

  return false;
}

export function defaultPathForUser(
  user: Pick<AuthUser, "role" | "systemRole" | "organization">,
): string {
  if (user.systemRole === "superadmin") {
    return "/admin/users";
  }
  if (needsOrganizationSetup(user)) {
    return "/onboarding/organization";
  }
  return isViewerRole(user.role) ? "/loans" : "/";
}

export function defaultPathForRole(role: OrganizationRole): string {
  return isViewerRole(role) ? "/loans" : "/";
}
