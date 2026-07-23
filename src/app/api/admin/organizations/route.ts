import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { listAdminOrganizations } from "@/modules/admin/services/adminOrganizations.server";

export async function GET() {
  try {
    const organizations = await listAdminOrganizations();
    return jsonData({ organizations });
  } catch (error) {
    return toErrorResponse(error);
  }
}
