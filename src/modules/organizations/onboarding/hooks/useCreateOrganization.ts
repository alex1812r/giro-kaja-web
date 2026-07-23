"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authQueryKeys } from "@/modules/auth/hooks/useCurrentUser";
import type { AuthOrganization } from "@/modules/auth/types";
import { apiFetch } from "@/shared/api/apiFetch";

import type { CreateOrganizationFormValues } from "../components/CreateOrganizationForm";

type CreateOrganizationResponse = {
  organization: AuthOrganization;
};

export function useCreateOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateOrganizationFormValues) =>
      apiFetch<CreateOrganizationResponse>("/api/organizations", {
        method: "POST",
        body: { name: values.name },
      }),
    onSuccess: async () => {
      queryClient.clear();
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      await queryClient.refetchQueries({ queryKey: authQueryKeys.me() });
      router.replace("/");
      router.refresh();
    },
  });
}
