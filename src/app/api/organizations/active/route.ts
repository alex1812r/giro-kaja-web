import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { switchActiveOrganizationForCurrentUser } from "@/modules/organizations/services/switchActiveOrganization.server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const user = await switchActiveOrganizationForCurrentUser(body);
    return jsonData({ user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
