import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getDebtDetail } from "@/modules/debts/services/debtDetail.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Falta el identificador de la deuda.");
    }

    const data = await getDebtDetail(id);
    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
