import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { deleteMyOrganization } from "@/modules/organizations/services/deleteMyOrganization.server";
import { getMyOrganizationDetail } from "@/modules/organizations/services/getMyOrganizationDetail.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currency = new URL(request.url).searchParams.get("currency");
    const organization = await getMyOrganizationDetail(id, currency);
    return jsonData({ organization });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteMyOrganization(id);
    return jsonData(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
