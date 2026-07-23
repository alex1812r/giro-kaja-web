export type AdminUserMembership = {
  organizationId: string;
  organizationName: string;
  role: string;
};

export type AdminUserListItem = {
  id: string;
  email: string | null;
  name: string;
  systemRole: string | null;
  isActive: boolean;
  memberships: AdminUserMembership[];
  createdAt: string | null;
};

export type AdminOrganizationListItem = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string | null;
  memberCount: number;
};

export type AdminOrganizationMember = {
  userId: string;
  email: string | null;
  name: string;
  role: string;
  createdAt: string;
};

export type AdminOrganizationDetail = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string | null;
  memberCount: number;
  loanCount: number;
  debtCount: number;
  members: AdminOrganizationMember[];
};
