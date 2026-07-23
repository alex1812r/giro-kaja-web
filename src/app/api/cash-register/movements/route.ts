import { ApiError, toErrorResponse } from "@/lib/api/apiError";
import { jsonData } from "@/lib/api/jsonResponse";
import { listCashMovements } from "@/modules/cash-register/services/listCashMovements.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new ApiError(400, "BAD_REQUEST", "Fechas inválidas.");
    }

    const pageRaw = searchParams.get("page");
    const pageSizeRaw = searchParams.get("pageSize");

    const data = await listCashMovements({
      startDate,
      endDate,
      currency: searchParams.get("currency") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: pageRaw != null ? Number(pageRaw) : undefined,
      pageSize: pageSizeRaw != null ? Number(pageSizeRaw) : undefined,
    });

    return jsonData(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
