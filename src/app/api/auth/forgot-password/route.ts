import { z } from "zod";

import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { mapSupabaseError } from "@/lib/supabase/errors";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

const forgotPasswordSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    const supabase = await createRouteSupabaseClient();
    const origin = new URL(request.url).origin;

    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      throw mapSupabaseError(error);
    }

    // Respuesta genérica para no filtrar si el correo existe.
    return jsonData({
      sent: true,
      message:
        "Si el correo existe, te enviamos un enlace para restablecer tu contraseña.",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
