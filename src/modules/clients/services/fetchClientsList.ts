import { apiFetch } from "@/shared/api/apiFetch";

import type { ClientListItem } from "../types";

export function fetchClientsList() {
  return apiFetch<ClientListItem[]>("/api/clients");
}
