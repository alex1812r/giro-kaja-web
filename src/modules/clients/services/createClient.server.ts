import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

import type { ClientListItem } from "../types";

const createClientBodySchema = z.object({
  name: z.string().trim().min(1),
  lastName: z.string().trim().optional().nullable(),
  phone: z.string().trim().min(1),
});

export type CreateClientBody = z.infer<typeof createClientBodySchema>;

function displayName(name: string, lastName: string | null): string {
  return [name, lastName].filter(Boolean).join(" ").trim() || "—";
}

export async function createClient(
  body: unknown,
): Promise<ClientListItem> {
  const parsed = createClientBodySchema.parse(body);

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const lastName = parsed.lastName?.trim() || null;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      name: parsed.name.trim(),
      last_name: lastName,
      phone: parsed.phone.trim(),
    })
    .select("id, name, last_name")
    .single();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return {
    id: data.id,
    name: data.name,
    lastName: data.last_name,
    displayName: displayName(data.name, data.last_name),
  };
}
