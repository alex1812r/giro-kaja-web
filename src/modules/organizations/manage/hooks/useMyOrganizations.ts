"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authQueryKeys } from "@/modules/auth/hooks/useCurrentUser";
import { defaultPathForUser, needsOrganizationSetup } from "@/modules/auth/roleAccess";
import type { AuthUser } from "@/modules/auth/types";
import type {
  MyOrganizationDetail,
  MyOrganizationItem,
} from "@/modules/organizations/types";
import { apiFetch } from "@/shared/api/apiFetch";
import type { CurrencyCode } from "@/shared/currency";

export const myOrganizationsQueryKeys = {
  all: ["organizations", "mine"] as const,
  detail: (id: string, currency: CurrencyCode) =>
    ["organizations", "mine", id, currency] as const,
};

export function useMyOrganizations() {
  return useQuery({
    queryKey: myOrganizationsQueryKeys.all,
    queryFn: async () => {
      const data = await apiFetch<{ organizations: MyOrganizationItem[] }>(
        "/api/organizations",
      );
      return data.organizations;
    },
  });
}

export function useMyOrganizationDetail(
  id: string | undefined,
  currency: CurrencyCode,
) {
  return useQuery({
    queryKey: myOrganizationsQueryKeys.detail(id ?? "", currency),
    enabled: Boolean(id),
    queryFn: async () => {
      const data = await apiFetch<{ organization: MyOrganizationDetail }>(
        `/api/organizations/${id}`,
        { query: { currency } },
      );
      return data.organization;
    },
  });
}

export function useCreateMyOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<{ organization: { id: string; name: string } }>(
        "/api/organizations",
        { method: "POST", body: { name } },
      ),
    onSuccess: async () => {
      queryClient.clear();
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      await queryClient.refetchQueries({ queryKey: authQueryKeys.me() });
      await queryClient.invalidateQueries({
        queryKey: myOrganizationsQueryKeys.all,
      });
      router.replace("/");
      router.refresh();
    },
  });
}

export function useDeleteMyOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ deletedOrganizationId: string; user: AuthUser }>(
        `/api/organizations/${id}`,
        { method: "DELETE" },
      ),
    onSuccess: async (data) => {
      queryClient.clear();
      queryClient.setQueryData(authQueryKeys.me(), { user: data.user });

      if (needsOrganizationSetup(data.user)) {
        router.replace("/onboarding/organization");
      } else {
        router.replace(defaultPathForUser(data.user));
      }
      router.refresh();
    },
  });
}
