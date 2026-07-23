import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { requireOperatorFromSession } from "@/lib/supabase/auth/profile.server";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

import { getLoanDetail } from "./loanDetail.server";
import type { LoanDetailResponse } from "../types";

const updateLoanBodySchema = z.object({
  nextPaymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)."),
});

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function updateLoan(
  loanId: string,
  body: unknown,
): Promise<LoanDetailResponse> {
  await requireOperatorFromSession();
  const parsed = updateLoanBodySchema.parse(body);
  const supabase = await createRouteSupabaseClient();

  const { data: existing, error: loadError } = await supabase
    .from("loans")
    .select("id, status")
    .eq("id", loanId)
    .maybeSingle<{ id: string; status: string }>();

  if (loadError) {
    throw new ApiError(500, "INTERNAL_ERROR", loadError.message);
  }
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Préstamo no encontrado.");
  }
  if (existing.status === "paid") {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "No se puede modificar un préstamo ya cancelado.",
    );
  }

  const nextPaymentDate = parsed.nextPaymentDate;
  const status = nextPaymentDate < todayUTC() ? "overdue" : "active";

  const { error: updateError } = await supabase
    .from("loans")
    .update({
      next_payment_date: nextPaymentDate,
      status,
    })
    .eq("id", loanId);

  if (updateError) {
    throw new ApiError(500, "INTERNAL_ERROR", updateError.message);
  }

  return getLoanDetail(loanId);
}
