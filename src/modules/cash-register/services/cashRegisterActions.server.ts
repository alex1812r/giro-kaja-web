import { z } from "zod";

import { ApiError } from "@/lib/api/apiError";
import { requireOperatorFromSession } from "@/lib/supabase/auth/profile.server";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";
import { isCurrencyCode, type CurrencyCode } from "@/shared/currency";

const amountSchema = z.number().finite().positive();

const depositBodySchema = z.object({
  amount: amountSchema,
  note: z.string().trim().max(500).optional().nullable(),
  currency: z.string().optional(),
});

const withdrawBodySchema = z.object({
  amount: amountSchema,
  reason: z.string().trim().min(1).max(500),
  currency: z.string().optional(),
});

const transferBodySchema = z
  .object({
    fromCurrency: z.string(),
    toCurrency: z.string(),
    amount: amountSchema,
  })
  .superRefine((value, ctx) => {
    if (!isCurrencyCode(value.fromCurrency)) {
      ctx.addIssue({
        code: "custom",
        message: "Moneda de origen inválida.",
        path: ["fromCurrency"],
      });
    }
    if (!isCurrencyCode(value.toCurrency)) {
      ctx.addIssue({
        code: "custom",
        message: "Moneda de destino inválida.",
        path: ["toCurrency"],
      });
    }
    if (
      isCurrencyCode(value.fromCurrency) &&
      isCurrencyCode(value.toCurrency) &&
      value.fromCurrency === value.toCurrency
    ) {
      ctx.addIssue({
        code: "custom",
        message: "SAME_CURRENCY",
        path: ["toCurrency"],
      });
    }
  });

function resolveCurrency(value: string | undefined | null): CurrencyCode {
  return isCurrencyCode(value ?? "") ? (value as CurrencyCode) : "USD";
}

async function getVaultBalance(
  currency: CurrencyCode,
): Promise<number> {
  const supabase = await createRouteSupabaseClient();
  const { data, error } = await supabase
    .from("vault_balances")
    .select("balance")
    .eq("currency", currency)
    .maybeSingle<{ balance: number | string }>();

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const n = Number(data?.balance ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function listVaultBalances(): Promise<Record<CurrencyCode, number>> {
  await requireOperatorFromSession();
  const supabase = await createRouteSupabaseClient();
  const { data, error } = await supabase
    .from("vault_balances")
    .select("currency, balance");

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  const result = {
    USD: 0,
    EUR: 0,
    VES: 0,
    USDT: 0,
  } satisfies Record<CurrencyCode, number>;

  for (const row of data ?? []) {
    const code = (row as { currency: string }).currency;
    if (isCurrencyCode(code)) {
      const n = Number((row as { balance: number | string }).balance ?? 0);
      result[code] = Number.isFinite(n) ? n : 0;
    }
  }

  return result;
}

export async function recordDeposit(body: unknown): Promise<{ ok: true }> {
  const operator = await requireOperatorFromSession();
  const parsed = depositBodySchema.parse(body);
  const currency = resolveCurrency(parsed.currency);
  const supabase = await createRouteSupabaseClient();

  const { error } = await supabase.from("transactions").insert({
    user_id: operator.id,
    ...(operator.organization
      ? { organization_id: operator.organization.id }
      : {}),
    transaction_type: "capital_deposit",
    amount: parsed.amount,
    reason: parsed.note?.trim() || null,
    currency,
  });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return { ok: true };
}

export async function recordWithdrawal(body: unknown): Promise<{ ok: true }> {
  const operator = await requireOperatorFromSession();
  const parsed = withdrawBodySchema.parse(body);
  const currency = resolveCurrency(parsed.currency);

  const balance = await getVaultBalance(currency);
  if (parsed.amount > balance) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "INSUFFICIENT_BALANCE",
    );
  }

  const supabase = await createRouteSupabaseClient();
  const { error } = await supabase.from("transactions").insert({
    user_id: operator.id,
    ...(operator.organization
      ? { organization_id: operator.organization.id }
      : {}),
    transaction_type: "capital_withdrawal",
    amount: parsed.amount,
    reason: parsed.reason.trim(),
    currency,
  });

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return { ok: true };
}

export async function recordVaultTransfer(body: unknown): Promise<{ ok: true }> {
  await requireOperatorFromSession();
  const parsed = transferBodySchema.parse(body);
  const supabase = await createRouteSupabaseClient();

  const { error } = await supabase.rpc("transfer_between_vault_balances", {
    p_from_currency: parsed.fromCurrency,
    p_to_currency: parsed.toCurrency,
    p_amount: parsed.amount,
  });

  if (error) {
    const msg = (error.message ?? "").toUpperCase();
    if (msg.includes("SAME_CURRENCY")) {
      throw new ApiError(400, "BAD_REQUEST", "SAME_CURRENCY");
    }
    if (msg.includes("INSUFFICIENT_BALANCE")) {
      throw new ApiError(400, "BAD_REQUEST", "INSUFFICIENT_BALANCE");
    }
    if (msg.includes("INVALID_AMOUNT")) {
      throw new ApiError(400, "BAD_REQUEST", "INVALID_AMOUNT");
    }
    if (msg.includes("FORBIDDEN")) {
      throw new ApiError(403, "FORBIDDEN", "No tienes permiso para transferir.");
    }
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return { ok: true };
}
