import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import {
  ensureLoanPortalLink,
  getLoanPortalLink,
  regenerateLoanPortalLink,
  revokeLoanPortalLink,
} from "@/modules/loans/services/loanPortalLink.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Falta el identificador del préstamo.");
    }

    const data = await getLoanPortalLink(id);
    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Falta el identificador del préstamo.");
    }

    let regenerate = false;
    try {
      const body = (await request.json()) as { regenerate?: unknown };
      regenerate = body?.regenerate === true;
    } catch {
      regenerate = false;
    }

    const data = regenerate
      ? await regenerateLoanPortalLink(id)
      : await ensureLoanPortalLink(id);

    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Falta el identificador del préstamo.");
    }

    await revokeLoanPortalLink(id);
    return jsonData(null);
  } catch (error) {
    return toErrorResponse(error);
  }
}
