"use client";

import { useMutation } from "@tanstack/react-query";

import type { ForgotPasswordFormValues } from "../components/ForgotPasswordForm";
import { requestPasswordReset } from "../services/requestPasswordReset";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => requestPasswordReset(values),
  });
}
