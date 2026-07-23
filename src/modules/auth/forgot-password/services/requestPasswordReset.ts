import { apiFetch } from "@/shared/api/apiFetch";

import type { ForgotPasswordFormValues } from "../components/ForgotPasswordForm";

export type ForgotPasswordResponse = {
  message: string;
  sent: boolean;
};

export async function requestPasswordReset(values: ForgotPasswordFormValues) {
  return apiFetch<ForgotPasswordResponse>("/api/auth/forgot-password", {
    body: values,
    method: "POST",
  });
}
