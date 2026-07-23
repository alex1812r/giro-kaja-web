export const TYPE_TO_I18N: Record<string, string> = {
  capital_deposit: "cashRegister.capitalDeposit",
  capital_withdrawal: "cashRegister.withdrawal",
  loan_disbursement: "cashRegister.loanDisbursement",
  interest_collection: "cashRegister.interestCollection",
  principal_collection: "cashRegister.principalCollection",
  debt_received: "cashRegister.debtReceived",
  debt_interest_payment: "cashRegister.debtInterest",
  debt_principal_payment: "cashRegister.debtPrincipal",
  vault_transfer_out: "cashRegister.vaultTransferOut",
  vault_transfer_in: "cashRegister.vaultTransferIn",
};

/** Options for the all-movements type filter (DB transaction_type values). */
export const MOVEMENT_TYPE_FILTER_OPTIONS: { value: string | null; labelKey: string }[] =
  [
    { value: null, labelKey: "cashRegister.allTypes" },
    ...Object.entries(TYPE_TO_I18N).map(([value, labelKey]) => ({
      value,
      labelKey,
    })),
  ];

const INFLOW_TYPES = new Set([
  "capital_deposit",
  "interest_collection",
  "principal_collection",
  "debt_received",
  "vault_transfer_in",
]);

/** English strings written by DB triggers — never show raw; use i18n type labels. */
const CANNED_ENGLISH_REASONS = new Set([
  "Loan disbursed to client",
  "Interest payment collection",
  "Principal amortization collection",
  "Debt interest payment",
  "Debt principal payment",
]);

export function transactionTypeKey(type: string): string {
  return TYPE_TO_I18N[type] ?? "cashRegister.withdrawal";
}

export function isInflowTransaction(type: string): boolean {
  return INFLOW_TYPES.has(type);
}

export function isCannedTransactionReason(
  reason: string | null | undefined,
): boolean {
  const trimmed = reason?.trim();
  if (!trimmed) {
    return true;
  }
  if (CANNED_ENGLISH_REASONS.has(trimmed)) {
    return true;
  }
  if (/^Transfer to [A-Z]{3}$/.test(trimmed)) {
    return true;
  }
  if (/^Transfer from [A-Z]{3}$/.test(trimmed)) {
    return true;
  }
  return false;
}

type MovementLabelInput = {
  transactionType: string;
  typeKey: string;
  reason: string | null;
};

/**
 * Prefer translated transaction type. Only surface free-text reasons
 * (deposits/withdrawals notes, debt lender) — never canned EN from triggers.
 */
export function cashMovementLabel(
  item: MovementLabelInput,
  t: (key: string, options?: { defaultValue?: string; lender?: string }) => string,
): string {
  const typeLabel = t(item.typeKey, { defaultValue: item.transactionType });
  const reason = item.reason?.trim() ?? "";

  if (!reason || isCannedTransactionReason(reason)) {
    return typeLabel;
  }

  if (
    item.transactionType === "debt_received" &&
    reason.startsWith("Debt received from ")
  ) {
    const lender = reason.slice("Debt received from ".length).trim();
    return lender
      ? t("cashRegister.debtReceivedFrom", {
          lender,
          defaultValue: typeLabel,
        })
      : typeLabel;
  }

  if (
    item.transactionType === "capital_deposit" ||
    item.transactionType === "capital_withdrawal"
  ) {
    return reason;
  }

  return typeLabel;
}
