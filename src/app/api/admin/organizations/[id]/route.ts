import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import {
  deleteAdminOrganization,
  getAdminOrganizationDetail,
} from "@/modules/admin/services/adminOrganizations.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const organization = await getAdminOrganizationDetail(id);
    return jsonData({ organization });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteAdminOrganization(id);
    return jsonData(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
