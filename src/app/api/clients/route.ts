import { toErrorResponse } from "@/lib/api/apiError";
import { jsonCreated, jsonData } from "@/lib/api/jsonResponse";
import { createClient } from "@/modules/clients/services/createClient.server";
import { getClientsList } from "@/modules/clients/services/clients.server";

export async function GET() {
  try {
    const data = await getClientsList();
    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createClient(body);
    return jsonCreated(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
