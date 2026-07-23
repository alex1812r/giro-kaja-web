import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { recordWithdrawal } from "@/modules/cash-register/services/cashRegisterActions.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await recordWithdrawal(body);
    return jsonData(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
