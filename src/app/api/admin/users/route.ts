import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import {
  createAdminUser,
  listAdminUsers,
} from "@/modules/admin/services/adminUsers.server";

export async function GET() {
  try {
    const users = await listAdminUsers();
    return jsonData({ users });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await createAdminUser(body);
    return jsonData({ user }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
