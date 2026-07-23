import { toErrorResponse } from "@/lib/api/apiError";
import { jsonCreated, jsonData } from "@/lib/api/jsonResponse";
import { createLoan } from "@/modules/loans/services/createLoan.server";
import { getLoansOverview } from "@/modules/loans/services/loans.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    const data = await getLoansOverview(currency);

    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createLoan(body);
    return jsonCreated(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
