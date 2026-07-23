import type { OrganizationRole } from "@/modules/auth/types";
import type { CurrencyCode } from "@/shared/currency";

export type MyOrganizationItem = {
  id: string;
  name: string;
  role: OrganizationRole;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  /** Only owners can hard-delete the tenant. */
  canDelete: boolean;
};

export type MyOrganizationMember = {
  userId: string;
  name: string;
  email: string | null;
  role: OrganizationRole;
  /** Viewer: follows every current/future loan in the org. */
  shareAllLoans: boolean;
  /** Viewer: number of explicit loan_shares rows. */
  sharedLoanCount: number;
  /** Viewer: loan ids currently shared (for edit prefill). */
  sharedLoanIds: string[];
};

export type OrgLoanShareOption = {
  id: string;
  clientName: string;
  currentPrincipal: number;
  currency: string;
  status: string;
  nextPaymentDate: string;
};

export type MyOrganizationDetail = {
  id: string;
  name: string;
  role: OrganizationRole;
  isActive: boolean;
  canDelete: boolean;
  /** Owner or admin can invite members. */
  canManageMembers: boolean;
  createdAt: string;
  memberCount: number;
  members: MyOrganizationMember[];
  /** Outstanding loan principal (active/overdue) in selected currency. */
  totalLent: number;
  /** Outstanding debt principal (active/overdue) in selected currency. */
  totalOwed: number;
  currency: CurrencyCode;
};
