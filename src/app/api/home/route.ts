import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getHomeDashboard } from "@/modules/home/services/home.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    const data = await getHomeDashboard(currency);

    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
