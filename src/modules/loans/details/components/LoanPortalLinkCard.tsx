"use client";

import { Check, Copy, Link2, Loader2, RefreshCw, Unlink } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button/Button";

import {
  useGenerateLoanPortalLink,
  useLoanPortalLink,
  useRegenerateLoanPortalLink,
  useRevokeLoanPortalLink,
} from "../../hooks/useLoanPortalLink";
import {
  ConfirmPortalLinkActionModal,
  type PortalLinkConfirmAction,
} from "./ConfirmPortalLinkActionModal";

type LoanPortalLinkCardProps = {
  loanId: string;
};

export function LoanPortalLinkCard({ loanId }: LoanPortalLinkCardProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useLoanPortalLink(loanId, true);
  const generate = useGenerateLoanPortalLink(loanId);
  const regenerate = useRegenerateLoanPortalLink(loanId);
  const revoke = useRevokeLoanPortalLink(loanId);
  const [copied, setCopied] = useState(false);
  const [confirmAction, setConfirmAction] =
    useState<PortalLinkConfirmAction | null>(null);

  const url = data?.url ?? null;
  const isBusy =
    isLoading ||
    generate.isPending ||
    regenerate.isPending ||
    revoke.isPending;
  const confirmPending =
    confirmAction === "revoke" ? revoke.isPending : regenerate.isPending;
  const confirmError =
    confirmAction === "revoke" ? revoke.error : regenerate.error;
  const generateError = generate.error;

  async function handleCopy() {
    if (!url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  }

  function closeConfirm() {
    if (confirmPending) {
      return;
    }
    setConfirmAction(null);
  }

  async function handleConfirm() {
    if (!confirmAction) {
      return;
    }

    try {
      if (confirmAction === "regenerate") {
        await regenerate.mutateAsync();
      } else {
        await revoke.mutateAsync();
      }
      setConfirmAction(null);
    } catch {
      // error shown in modal
    }
  }

  return (
    <>
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="inline-flex items-center gap-2 font-headline text-base font-semibold text-text-main">
              <Link2 className="size-4 text-primary" aria-hidden />
              {t("loans.portalLinkTitle")}
            </h2>
            <p className="text-sm text-text-secondary">
              {t("loans.portalLinkSubtitle")}
            </p>
          </div>

          {!url ? (
            <Button
              type="button"
              size="sm"
              disabled={isBusy}
              onClick={() => {
                void generate.mutateAsync();
              }}
            >
              {generate.isPending || isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              {t("loans.portalLinkGenerate")}
            </Button>
          ) : null}
        </div>

        {generateError ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {generateError instanceof Error
              ? generateError.message
              : t("loans.portalLinkError")}
          </p>
        ) : null}

        {url ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly
                value={url}
                aria-label={t("loans.portalLinkTitle")}
                className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface-muted px-3 text-sm text-text-main outline-none"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isBusy}
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                {copied
                  ? t("loans.portalLinkCopied")
                  : t("loans.portalLinkCopy")}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isBusy}
                onClick={() => setConfirmAction("regenerate")}
              >
                <RefreshCw className="size-4" aria-hidden />
                {t("loans.portalLinkRegenerate")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={isBusy}
                onClick={() => setConfirmAction("revoke")}
              >
                <Unlink className="size-4" aria-hidden />
                {t("loans.portalLinkRevoke")}
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <ConfirmPortalLinkActionModal
        action={confirmAction}
        open={Boolean(confirmAction)}
        isPending={confirmPending}
        errorMessage={
          confirmError instanceof Error ? confirmError.message : null
        }
        onClose={closeConfirm}
        onConfirm={() => {
          void handleConfirm();
        }}
      />
    </>
  );
}
