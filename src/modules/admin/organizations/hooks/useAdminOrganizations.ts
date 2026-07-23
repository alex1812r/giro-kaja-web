"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminOrganizationDetail,
  AdminOrganizationListItem,
} from "@/modules/admin/types";
import { apiFetch } from "@/shared/api/apiFetch";

export const adminOrgsQueryKeys = {
  all: ["admin", "organizations"] as const,
  detail: (id: string) => ["admin", "organizations", id] as const,
};

export function useAdminOrganizations() {
  return useQuery({
    queryKey: adminOrgsQueryKeys.all,
    queryFn: async () => {
      const data = await apiFetch<{ organizations: AdminOrganizationListItem[] }>(
        "/api/admin/organizations",
      );
      return data.organizations;
    },
  });
}

export function useAdminOrganizationDetail(id: string | undefined) {
  return useQuery({
    queryKey: adminOrgsQueryKeys.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const data = await apiFetch<{ organization: AdminOrganizationDetail }>(
        `/api/admin/organizations/${id}`,
      );
      return data.organization;
    },
  });
}

export type DeleteAdminOrganizationResponse = {
  deletedOrganizationId: string;
};

export function useDeleteAdminOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<DeleteAdminOrganizationResponse>(
        `/api/admin/organizations/${id}`,
        { method: "DELETE" },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminOrgsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
      ]);
    },
  });
}
