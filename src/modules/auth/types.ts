export type OrganizationRole = "owner" | "admin" | "viewer";

export type SystemRole = "superadmin";

export type AuthOrganization = {
  id: string;
  name: string;
};

export type AuthMembership = {
  organization: AuthOrganization;
  role: OrganizationRole;
};

export type AuthUser = {
  email?: string;
  id: string;
  name: string;
  phone?: string | null;
  /** Role in the active organization. Defaults to owner when membership is missing (legacy). */
  role: OrganizationRole;
  organization: AuthOrganization | null;
  /** All org memberships (for switcher). Active org is `organization`. */
  memberships: AuthMembership[];
  /** Platform role; orthogonal to organization membership. */
  systemRole: SystemRole | null;
  isActive: boolean;
};

export function isOrganizationRole(value: unknown): value is OrganizationRole {
  return value === "owner" || value === "admin" || value === "viewer";
}

export function isSystemRole(value: unknown): value is SystemRole {
  return value === "superadmin";
}

export function isViewerRole(role: OrganizationRole): boolean {
  return role === "viewer";
}

/** owner | admin — full operational access */
export function isOperatorRole(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

export function isSuperadmin(user: Pick<AuthUser, "systemRole">): boolean {
  return user.systemRole === "superadmin";
}
