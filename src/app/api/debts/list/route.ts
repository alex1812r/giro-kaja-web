import { toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { getDebtsList } from "@/modules/debts/services/debtsList.server";

function parseOptionalInt(value: string | null): number | undefined {
  if (value == null || value === "") {
    return undefined;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nextPaymentDateFrom = searchParams.get("nextPaymentDateFrom");
    const nextPaymentDateTo = searchParams.get("nextPaymentDateTo");

    if (!nextPaymentDateFrom || !nextPaymentDateTo) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Debes indicar el rango de fecha de corte.",
          },
        },
        { status: 400 },
      );
    }

    const data = await getDebtsList({
      currency: searchParams.get("currency") ?? undefined,
      lender: searchParams.get("lender") ?? undefined,
      nextPaymentDateFrom,
      nextPaymentDateTo,
      page: parseOptionalInt(searchParams.get("page")),
      pageSize: parseOptionalInt(searchParams.get("pageSize")),
    });

    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
