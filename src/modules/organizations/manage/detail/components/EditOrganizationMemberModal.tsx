"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { MyOrganizationMember } from "@/modules/organizations/types";
import { ClientApiError } from "@/shared/api/apiFetch";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import {
  useOrgLoansForShare,
  useUpdateOrganizationMember,
} from "../../hooks/useOrganizationMembers";

type EditOrganizationMemberModalProps = {
  organizationId: string;
  member: MyOrganizationMember | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export function EditOrganizationMemberModal({
  organizationId,
  member,
  open,
  onClose,
  onUpdated,
}: EditOrganizationMemberModalProps) {
  const { t } = useTranslation();
  const updateMember = useUpdateOrganizationMember();
  const loansQuery = useOrgLoansForShare(open ? organizationId : undefined);

  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("admin");
  const [shareMode, setShareMode] = useState<"all" | "selected">("all");
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !member) {
      return;
    }
    setName(member.name);
    setRole(member.role === "viewer" ? "viewer" : "admin");
    setShareMode(member.shareAllLoans ? "all" : "selected");
    setSelectedLoanIds(member.sharedLoanIds ?? []);
    setErrorMessage(null);
  }, [open, member]);

  function toggleLoan(loanId: string) {
    setSelectedLoanIds((current) =>
      current.includes(loanId)
        ? current.filter((id) => id !== loanId)
        : [...current, loanId],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!member) {
      return;
    }
    setErrorMessage(null);

    try {
      await updateMember.mutateAsync({
        organizationId,
        userId: member.userId,
        name,
        role,
        shareAllLoans: role === "viewer" ? shareMode === "all" : false,
        loanIds:
          role === "viewer" && shareMode === "selected" ? selectedLoanIds : [],
      });
      onUpdated();
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof ClientApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("myOrganizations.memberUpdateFailed"),
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("myOrganizations.memberEditTitle")}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={updateMember.isPending}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="edit-org-member-form"
            disabled={updateMember.isPending || !member}
          >
            {updateMember.isPending
              ? t("myOrganizations.memberUpdating")
              : t("myOrganizations.memberEditAction")}
          </Button>
        </div>
      }
    >
      <form
        id="edit-org-member-form"
        className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
      >
        <p className="text-sm text-text-secondary">
          {t("myOrganizations.memberEditSubtitle")}
        </p>

        {member?.email ? (
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-main">
              {t("myOrganizations.formEmail")}
            </span>
            {": "}
            {member.email}
          </p>
        ) : null}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-main">
            {t("myOrganizations.formName")}
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-md border border-border bg-surface px-3"
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text-main">
            {t("myOrganizations.formRole")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {(["admin", "viewer"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  role === option
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border text-text-secondary hover:bg-surface-muted",
                )}
              >
                {option === "admin"
                  ? t("myOrganizations.roleAdmin")
                  : t("myOrganizations.roleViewer")}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-secondary">
            {role === "admin"
              ? t("myOrganizations.roleAdminHint")
              : t("myOrganizations.roleViewerHint")}
          </p>
        </fieldset>

        {role === "viewer" ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-text-main">
              {t("myOrganizations.loanAccessTitle")}
            </legend>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="editShareMode"
                  checked={shareMode === "all"}
                  onChange={() => setShareMode("all")}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-text-main">
                    {t("myOrganizations.loanAccessAll")}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-secondary">
                    {t("myOrganizations.loanAccessAllHint")}
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="editShareMode"
                  checked={shareMode === "selected"}
                  onChange={() => setShareMode("selected")}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-text-main">
                    {t("myOrganizations.loanAccessSelected")}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-secondary">
                    {t("myOrganizations.loanAccessSelectedHint")}
                  </span>
                </span>
              </label>
            </div>

            {shareMode === "selected" ? (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {loansQuery.isLoading ? (
                  <p className="px-2 py-3 text-xs text-text-secondary">
                    {t("common.loading")}
                  </p>
                ) : (loansQuery.data?.length ?? 0) === 0 ? (
                  <p className="px-2 py-3 text-xs text-text-secondary">
                    {t("myOrganizations.noLoansToShare")}
                  </p>
                ) : (
                  loansQuery.data?.map((loan) => {
                    const checked = selectedLoanIds.includes(loan.id);
                    return (
                      <label
                        key={loan.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-surface-muted",
                          checked && "bg-primary-light/60",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLoan(loan.id)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-text-main">
                            {loan.clientName}
                          </span>
                          <span className="block text-xs text-text-secondary">
                            {formatMoney(loan.currentPrincipal, loan.currency)}
                            {" · "}
                            {loan.nextPaymentDate.slice(0, 10)}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            ) : null}
          </fieldset>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
