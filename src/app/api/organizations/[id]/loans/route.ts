import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { listOrgLoansForShare } from "@/modules/organizations/services/listOrgLoansForShare.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const loans = await listOrgLoansForShare(id);
    return jsonData({ loans });
  } catch (error) {
    return toErrorResponse(error);
  }
}
