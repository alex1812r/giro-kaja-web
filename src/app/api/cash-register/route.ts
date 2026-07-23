import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getCashRegisterSummary } from "@/modules/cash-register/services/cashRegister.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    const data = await getCashRegisterSummary(currency);

    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
