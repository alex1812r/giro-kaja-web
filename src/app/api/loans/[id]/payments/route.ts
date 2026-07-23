import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonCreated } from "@/lib/api/jsonResponse";
import { createLoanPayment } from "@/modules/loans/services/createPayment.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Falta el identificador del préstamo.");
    }

    const body = await request.json();
    const data = await createLoanPayment(id, body);
    return jsonCreated(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
