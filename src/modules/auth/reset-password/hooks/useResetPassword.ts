"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { ResetPasswordFormValues } from "../components/ResetPasswordForm";
import { updatePassword } from "../services/updatePassword";

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: ResetPasswordFormValues) => updatePassword(values),
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });
}
