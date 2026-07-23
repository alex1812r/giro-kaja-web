import { ApiError } from "@/lib/api/apiError";

type SupabaseLikeError = {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
};

function isSupabaseLikeError(error: unknown): error is SupabaseLikeError {
  return typeof error === "object" && error !== null && "message" in error;
}

export function getSupabaseErrorMessage(error: unknown) {
  if (isSupabaseLikeError(error) && error.message) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected Supabase error.";
}

export function mapSupabaseError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isSupabaseLikeError(error)) {
    switch (error.code) {
      case "23505":
        return new ApiError(409, "CONFLICT", "El recurso ya existe.");
      case "PGRST116":
        return new ApiError(404, "NOT_FOUND", "Recurso no encontrado.");
      case "23503":
        return new ApiError(400, "BAD_REQUEST", "Referencia inválida.");
      case "23514":
      case "23502":
      case "22P02":
        return new ApiError(
          400,
          "BAD_REQUEST",
          error.message ?? "Los datos enviados no son válidos.",
        );
      case "42501":
        return new ApiError(403, "FORBIDDEN", "No autorizado para esta operación.");
      default:
        break;
    }

    const message = error.message?.toLowerCase() ?? "";

    if (message.includes("invalid login credentials")) {
      return new ApiError(401, "UNAUTHORIZED", "Credenciales inválidas.");
    }

    if (message.includes("email not confirmed")) {
      return new ApiError(
        401,
        "UNAUTHORIZED",
        "Debes confirmar tu correo antes de ingresar.",
      );
    }

    if (message.includes("auth session missing")) {
      return new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
    }

    if (message.includes("new password should be different")) {
      return new ApiError(
        400,
        "BAD_REQUEST",
        "La nueva contraseña debe ser distinta a la actual.",
      );
    }
  }

  return new ApiError(500, "INTERNAL_ERROR", getSupabaseErrorMessage(error));
}

export function throwIfSupabaseError(error: unknown): void {
  if (error) {
    throw mapSupabaseError(error);
  }
}
