import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { recordVaultTransfer } from "@/modules/cash-register/services/cashRegisterActions.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await recordVaultTransfer(body);
    return jsonData(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
