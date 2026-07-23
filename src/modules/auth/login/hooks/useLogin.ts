"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authQueryKeys } from "@/modules/auth/hooks/useCurrentUser";
import {
  defaultPathForUser,
  isPathAllowedForUser,
  needsOrganizationSetup,
} from "@/modules/auth/roleAccess";

import type { LoginFormValues } from "../components/LoginForm";
import { loginWithPassword } from "../services/loginWithPassword";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginWithPassword(values),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryKeys.me(), { user: data.user });
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });

      // Must finish org onboarding before honoring ?next=
      if (needsOrganizationSetup(data.user)) {
        router.replace("/onboarding/organization");
        router.refresh();
        return;
      }

      const nextPath = new URLSearchParams(window.location.search).get("next");
      const safeNext =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : null;

      const destination =
        safeNext && isPathAllowedForUser(safeNext, data.user)
          ? safeNext
          : defaultPathForUser(data.user);

      router.push(destination);
      router.refresh();
    },
  });
}

