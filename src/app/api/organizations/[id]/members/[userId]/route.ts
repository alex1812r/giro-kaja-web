import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { deleteOrganizationMember } from "@/modules/organizations/services/deleteOrganizationMember.server";
import { updateOrganizationMember } from "@/modules/organizations/services/updateOrganizationMember.server";

type RouteContext = {
  params: Promise<{ id: string; userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id, userId } = await context.params;
    const body = await request.json();
    const member = await updateOrganizationMember(id, userId, body);
    return jsonData({ member });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id, userId } = await context.params;
    const result = await deleteOrganizationMember(id, userId);
    return jsonData(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
