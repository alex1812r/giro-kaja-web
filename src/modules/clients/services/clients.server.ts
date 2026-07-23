import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

import type { ClientListItem } from "../types";

type ClientRow = {
  id: string;
  name: string;
  last_name: string | null;
};

function displayName(row: ClientRow): string {
  return [row.name, row.last_name].filter(Boolean).join(" ").trim() || "—";
}

export async function getClientsList(): Promise<ClientListItem[]> {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, last_name")
    .order("name", { ascending: true });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return ((data ?? []) as ClientRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    lastName: row.last_name,
    displayName: displayName(row),
  }));
}
