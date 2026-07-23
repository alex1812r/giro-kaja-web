import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { createOrganizationMember } from "@/modules/organizations/services/createOrganizationMember.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const member = await createOrganizationMember(id, body);
    return jsonData({ member }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
