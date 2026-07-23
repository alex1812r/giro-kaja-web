import type { AuthUser } from "@/modules/auth/types";
import { apiFetch } from "@/shared/api/apiFetch";

import type { LoginFormValues } from "../components/LoginForm";

export type LoginResponse = {
  user: AuthUser;
};

export async function loginWithPassword(values: LoginFormValues) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    body: {
      email: values.email,
      password: values.password,
      remember: values.remember,
    },
    method: "POST",
  });
}
