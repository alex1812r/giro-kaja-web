import { toErrorResponse } from "@/lib/api/apiError";
import { jsonCreated, jsonData } from "@/lib/api/jsonResponse";
import { createDebt } from "@/modules/debts/services/createDebt.server";
import { getDebtsOverview } from "@/modules/debts/services/debts.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    const data = await getDebtsOverview(currency);
    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createDebt(body);
    return jsonCreated(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
