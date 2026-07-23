import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getAuthProfileFromSession } from "@/lib/supabase/auth/profile.server";

export async function GET() {
  try {
    const profile = await getAuthProfileFromSession();

    if (!profile) {
      throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
    }

    return jsonData({
      user: profile,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
