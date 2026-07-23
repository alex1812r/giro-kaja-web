import { apiFetch } from "@/shared/api/apiFetch";

import type { ResetPasswordFormValues } from "../components/ResetPasswordForm";

export type ResetPasswordResponse = {
  updated: boolean;
};

export async function updatePassword(values: ResetPasswordFormValues) {
  return apiFetch<ResetPasswordResponse>("/api/auth/reset-password", {
    body: values,
    method: "POST",
  });
}
