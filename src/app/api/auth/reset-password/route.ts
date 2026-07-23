import { z } from "zod";

import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { mapSupabaseError } from "@/lib/supabase/errors";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export async function POST(request: Request) {
  try {
    const input = resetPasswordSchema.parse(await request.json());
    const supabase = await createRouteSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw mapSupabaseError(userError);
    }

    if (!user) {
      throw new ApiError(
        401,
        "UNAUTHORIZED",
        "El enlace expiró o no es válido. Solicita uno nuevo.",
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: input.password,
    });

    if (error) {
      throw mapSupabaseError(error);
    }

    return jsonData({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
