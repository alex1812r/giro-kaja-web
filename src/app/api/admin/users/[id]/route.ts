import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import {
  deleteAdminUser,
  patchAdminUser,
} from "@/modules/admin/services/adminUsers.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const user = await patchAdminUser(id, body);
    return jsonData({ user });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteAdminUser(id);
    return jsonData(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
