import { ApiError } from "@/lib/api/apiError";
import { buildClientPortalLoanUrl, getAppBaseUrl } from "@/lib/appUrl";
import { createRouteSupabaseClient } from "@/lib/supabase/route-client";

export type LoanPortalLinkResult = {
  token: string;
  url: string;
  created: boolean;
};

type LoanClientContext = {
  loanId: string;
  clientId: string;
  portalToken: string | null;
  supabase: Awaited<ReturnType<typeof createRouteSupabaseClient>>;
};

async function requireLoanClientContext(
  loanId: string,
): Promise<LoanClientContext> {
  getAppBaseUrl();

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, client_id")
    .eq("id", loanId)
    .maybeSingle();

  if (loanError) {
    throw new ApiError(500, "INTERNAL_ERROR", loanError.message);
  }

  if (!loan) {
    throw new ApiError(404, "NOT_FOUND", "Préstamo no encontrado.");
  }

  if (!loan.client_id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Este préstamo no tiene cliente asociado.",
    );
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, portal_token")
    .eq("id", loan.client_id)
    .maybeSingle();

  if (clientError) {
    throw new ApiError(500, "INTERNAL_ERROR", clientError.message);
  }

  if (!client) {
    throw new ApiError(404, "NOT_FOUND", "Cliente no encontrado.");
  }

  return {
    loanId,
    clientId: client.id,
    portalToken: client.portal_token,
    supabase,
  };
}

async function issuePortalToken(
  ctx: LoanClientContext,
): Promise<LoanPortalLinkResult> {
  const { data: tokenData, error: tokenError } = await ctx.supabase.rpc(
    "generate_client_portal_token",
  );

  if (tokenError || typeof tokenData !== "string" || !tokenData) {
    throw new ApiError(
      500,
      "INTERNAL_ERROR",
      tokenError?.message ?? "No se pudo generar el token del portal.",
    );
  }

  const { data: updated, error: updateError } = await ctx.supabase
    .from("clients")
    .update({
      portal_token: tokenData,
      portal_token_created_at: new Date().toISOString(),
    })
    .eq("id", ctx.clientId)
    .select("portal_token")
    .maybeSingle();

  if (updateError) {
    throw new ApiError(500, "INTERNAL_ERROR", updateError.message);
  }

  const token = updated?.portal_token;
  if (!token) {
    throw new ApiError(500, "INTERNAL_ERROR", "No se pudo guardar el token del portal.");
  }

  return {
    token,
    url: buildClientPortalLoanUrl(token, ctx.loanId),
    created: true,
  };
}

/** Create token if missing; otherwise return the existing link. */
export async function ensureLoanPortalLink(
  loanId: string,
): Promise<LoanPortalLinkResult> {
  const ctx = await requireLoanClientContext(loanId);

  if (ctx.portalToken) {
    return {
      token: ctx.portalToken,
      url: buildClientPortalLoanUrl(ctx.portalToken, loanId),
      created: false,
    };
  }

  return issuePortalToken(ctx);
}

/** Replace token so previous links stop working. */
export async function regenerateLoanPortalLink(
  loanId: string,
): Promise<LoanPortalLinkResult> {
  const ctx = await requireLoanClientContext(loanId);
  return issuePortalToken(ctx);
}

/** Clear token so all client portal links stop working. */
export async function revokeLoanPortalLink(loanId: string): Promise<null> {
  const ctx = await requireLoanClientContext(loanId);

  if (!ctx.portalToken) {
    return null;
  }

  const { error } = await ctx.supabase
    .from("clients")
    .update({
      portal_token: null,
      portal_token_created_at: null,
    })
    .eq("id", ctx.clientId);

  if (error) {
    throw new ApiError(500, "INTERNAL_ERROR", error.message);
  }

  return null;
}

export async function getLoanPortalLink(
  loanId: string,
): Promise<LoanPortalLinkResult | null> {
  try {
    getAppBaseUrl();
  } catch {
    return null;
  }

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Debes iniciar sesión para continuar.");
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, client_id, clients(portal_token)")
    .eq("id", loanId)
    .maybeSingle();

  if (loanError) {
    throw new ApiError(500, "INTERNAL_ERROR", loanError.message);
  }

  if (!loan?.client_id) {
    return null;
  }

  const clients = loan.clients as
    | { portal_token: string | null }
    | { portal_token: string | null }[]
    | null;
  const client = Array.isArray(clients) ? clients[0] : clients;
  const token = client?.portal_token;

  if (!token) {
    return null;
  }

  return {
    token,
    url: buildClientPortalLoanUrl(token, loanId),
    created: false,
  };
}
