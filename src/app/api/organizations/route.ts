import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { createOrganizationForCurrentUser } from "@/modules/organizations/services/createOrganization.server";
import { listMyOrganizations } from "@/modules/organizations/services/listMyOrganizations.server";

export async function GET() {
  try {
    const organizations = await listMyOrganizations();
    return jsonData({ organizations });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organization = await createOrganizationForCurrentUser(body);
    return jsonData({ organization }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
