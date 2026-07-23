import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { listVaultBalances } from "@/modules/cash-register/services/cashRegisterActions.server";

export async function GET() {
  try {
    const balances = await listVaultBalances();
    return jsonData({ balances });
  } catch (error) {
    return toErrorResponse(error);
  }
}
