import { apiFetch } from "@/shared/api/apiFetch";

import type { ClientListItem } from "../types";

export type CreateClientInput = {
  name: string;
  lastName?: string;
  phone: string;
};

export function createClient(input: CreateClientInput) {
  return apiFetch<ClientListItem>("/api/clients", {
    method: "POST",
    body: input,
  });
}
