import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getPortalLoan } from "@/modules/client-portal/services/portalLoan.server";

type RouteContext = {
  params: Promise<{ token: string; loanId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { token, loanId } = await context.params;

    if (!token?.trim() || !loanId?.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "Enlace de portal inválido.");
    }

    const data = await getPortalLoan(token, loanId);
    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
