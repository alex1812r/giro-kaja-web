"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authQueryKeys } from "@/modules/auth/hooks/useCurrentUser";
import { defaultPathForUser } from "@/modules/auth/roleAccess";
import type { AuthUser } from "@/modules/auth/types";
import { apiFetch } from "@/shared/api/apiFetch";

type SwitchOrganizationResponse = {
  user: AuthUser;
};

export function useSwitchOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      apiFetch<SwitchOrganizationResponse>("/api/organizations/active", {
        method: "PATCH",
        body: { organizationId },
      }),
    onSuccess: async (data) => {
      // Drop cached tenant data from the previous org, keep fresh session.
      queryClient.clear();
      queryClient.setQueryData(authQueryKeys.me(), { user: data.user });

      const destination = defaultPathForUser(data.user);
      router.replace(destination);
      router.refresh();
    },
  });
}
