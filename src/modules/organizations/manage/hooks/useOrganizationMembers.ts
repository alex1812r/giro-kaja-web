"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  MyOrganizationMember,
  OrgLoanShareOption,
} from "@/modules/organizations/types";
import { apiFetch } from "@/shared/api/apiFetch";

import { myOrganizationsQueryKeys } from "./useMyOrganizations";

export type CreateOrganizationMemberInput = {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "viewer";
  shareAllLoans?: boolean;
  loanIds?: string[];
};

export function useOrgLoansForShare(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["organizations", organizationId, "loans-for-share"] as const,
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const data = await apiFetch<{ loans: OrgLoanShareOption[] }>(
        `/api/organizations/${organizationId}/loans`,
      );
      return data.loans;
    },
  });
}

export type UpdateOrganizationMemberInput = {
  organizationId: string;
  userId: string;
  name: string;
  role: "admin" | "viewer";
  shareAllLoans?: boolean;
  loanIds?: string[];
};

async function invalidateOrgMemberQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: ["organizations", "mine", organizationId],
  });
  await queryClient.invalidateQueries({
    queryKey: myOrganizationsQueryKeys.all,
  });
}

export function useCreateOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, ...body }: CreateOrganizationMemberInput) =>
      apiFetch<{ member: MyOrganizationMember }>(
        `/api/organizations/${organizationId}/members`,
        { method: "POST", body },
      ),
    onSuccess: async (_data, variables) => {
      await invalidateOrgMemberQueries(queryClient, variables.organizationId);
    },
  });
}

export function useUpdateOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      ...body
    }: UpdateOrganizationMemberInput) =>
      apiFetch<{ member: MyOrganizationMember }>(
        `/api/organizations/${organizationId}/members/${userId}`,
        { method: "PATCH", body },
      ),
    onSuccess: async (_data, variables) => {
      await invalidateOrgMemberQueries(queryClient, variables.organizationId);
    },
  });
}

export function useDeleteOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
    }: {
      organizationId: string;
      userId: string;
    }) =>
      apiFetch<{ deletedUserId: string }>(
        `/api/organizations/${organizationId}/members/${userId}`,
        { method: "DELETE" },
      ),
    onSuccess: async (_data, variables) => {
      await invalidateOrgMemberQueries(queryClient, variables.organizationId);
    },
  });
}
