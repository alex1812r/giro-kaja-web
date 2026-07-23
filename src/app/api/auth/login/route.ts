import { z } from "zod";

import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getAuthProfileAfterLogin } from "@/lib/supabase/auth/profile.server";
import { mapSupabaseError } from "@/lib/supabase/errors";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const supabase = await createRouteSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw mapSupabaseError(error);
    }

    if (!data.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Credenciales inválidas.");
    }

    const profile = await getAuthProfileAfterLogin(
      data.user.id,
      data.user.email,
    );

    console.info("[auth/login]", {
      userId: profile.id,
      systemRole: profile.systemRole,
      organizationId: profile.organization?.id ?? null,
      needsOrganizationSetup: !profile.systemRole && !profile.organization?.id,
    });

    return jsonData({
      user: profile,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
