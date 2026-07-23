"use client";

import { useQuery } from "@tanstack/react-query";

import {
  isOperatorRole,
  isSuperadmin,
  isViewerRole,
  type AuthUser,
  type OrganizationRole,
} from "@/modules/auth/types";
import { apiFetch } from "@/shared/api/apiFetch";

export type CurrentUser = AuthUser;

export type CurrentUserResponse = {
  user: CurrentUser;
};

export const authQueryKeys = {
  all: ["auth"] as const,
  me: () => [...authQueryKeys.all, "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: () => apiFetch<CurrentUserResponse>("/api/auth/me"),
    // Session is shared across shells; avoid refetch storms on remount/navigation.
    staleTime: 60_000,
    refetchOnMount: false,
  });
}

/** Active organization + role from the centralized auth/me session. */
export function useSessionOrganization() {
  const query = useCurrentUser();
  const user = query.data?.user;

  return {
    ...query,
    organization: user?.organization ?? null,
    role: (user?.role ?? "owner") as OrganizationRole,
    isViewer: user ? isViewerRole(user.role) && !isSuperadmin(user) : false,
    isOperator:
      user && !isSuperadmin(user) ? isOperatorRole(user.role) : false,
    isSuperadmin: user ? isSuperadmin(user) : false,
  };
}
