import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getLoanDetail } from "@/modules/loans/services/loanDetail.server";
import { updateLoan } from "@/modules/loans/services/updateLoan.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Falta el identificador del préstamo.");
    }

    const data = await getLoanDetail(id);
    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Falta el identificador del préstamo.");
    }

    const body = await request.json();
    const data = await updateLoan(id, body);
    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
