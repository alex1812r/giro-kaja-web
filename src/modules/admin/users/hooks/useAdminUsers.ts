"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminUserListItem } from "@/modules/admin/types";
import { apiFetch } from "@/shared/api/apiFetch";

export const adminUsersQueryKeys = {
  all: ["admin", "users"] as const,
};

type UsersResponse = { users: AdminUserListItem[] };
type UserResponse = { user: AdminUserListItem };

export function useAdminUsers() {
  return useQuery({
    queryKey: adminUsersQueryKeys.all,
    queryFn: async () => {
      const data = await apiFetch<UsersResponse>("/api/admin/users");
      return data.users;
    },
    staleTime: 30_000,
    refetchOnMount: false,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string; name: string }) =>
      apiFetch<UserResponse>("/api/admin/users", {
        method: "POST",
        body,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
    },
  });
}

export function usePatchAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch<UserResponse>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: { isActive },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
    },
  });
}

export type DeleteAdminUserResponse = {
  deletedUserId: string;
  deletedOrganizationIds: string[];
};

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<DeleteAdminUserResponse>(`/api/admin/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] }),
      ]);
    },
  });
}
