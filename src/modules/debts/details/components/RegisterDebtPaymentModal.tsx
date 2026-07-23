"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ClientApiError } from "@/shared/api/apiFetch";
import { Button } from "@/shared/components/Button/Button";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import { debtsQueryKeys } from "../../hooks/useDebtsOverview";
import { createDebtPayment } from "../../services/createDebtPayment";
import type { DebtDetail } from "../../types";
import {
  createRegisterDebtPaymentFormSchema,
  type RegisterDebtPaymentFormValues,
} from "../schemas/registerDebtPaymentFormSchema";

const fieldClass = cn(
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none",
  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type RegisterDebtPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  debt: DebtDetail;
};

export function RegisterDebtPaymentModal({
  open,
  onClose,
  debt,
}: RegisterDebtPaymentModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const expectedInterest = useMemo(
    () => (debt.currentPrincipal * debt.interestRate) / 100,
    [debt.currentPrincipal, debt.interestRate],
  );

  const schema = useMemo(
    () => createRegisterDebtPaymentFormSchema(expectedInterest),
    [expectedInterest],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterDebtPaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentDate: todayISO(),
      amountPaid: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        paymentDate: todayISO(),
        amountPaid: "",
        description: "",
      });
    }
  }, [open, reset, debt.id]);

  const amountPaidStr = useWatch({ control, name: "amountPaid" }) ?? "";
  const amountNum = parseFloat(amountPaidStr.replace(/,/g, ".")) || 0;
  const amortization = Math.max(0, amountNum - expectedInterest);
  const principalAfter = Math.max(0, debt.currentPrincipal - amortization);
  const currency = debt.currency || "USD";

  const mutation = useMutation({
    mutationFn: (values: RegisterDebtPaymentFormValues) =>
      createDebtPayment(debt.id, {
        paymentDate: values.paymentDate,
        amountPaid: parseFloat(values.amountPaid.replace(/,/g, ".")) || 0,
        description: values.description?.trim() || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: debtsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["cash-register"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
      onClose();
    },
  });

  const submitError =
    mutation.error instanceof ClientApiError &&
    mutation.error.code === "INSUFFICIENT_BALANCE"
      ? t("debts.insufficientBalance")
      : mutation.isError
        ? t("debts.paymentRegisterError")
        : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("debts.registerDebtPayment")}
      className="max-w-lg"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="register-debt-payment-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("common.loading")
              : t("common.confirmPayment")}
          </Button>
        </>
      }
    >
      <form
        id="register-debt-payment-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-text-main"
              htmlFor="debt-payment-date"
            >
              {t("debts.paymentDateLabel")}
            </label>
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="debt-payment-date"
                  type="date"
                  className={cn(
                    fieldClass,
                    errors.paymentDate && "border-danger",
                  )}
                />
              )}
            />
            {errors.paymentDate ? (
              <p className="text-xs text-danger">
                {t(errors.paymentDate.message!)}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-text-main"
              htmlFor="debt-payment-amount"
            >
              {t("debts.amountPaid")}
            </label>
            <div className="relative">
              <Controller
                name="amountPaid"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="debt-payment-amount"
                    inputMode="decimal"
                    className={cn(
                      fieldClass,
                      "pr-16",
                      errors.amountPaid && "border-danger",
                    )}
                    placeholder={t("debts.placeholderAmount")}
                  />
                )}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-text-secondary">
                {currency}
              </span>
            </div>
            {errors.amountPaid ? (
              <p className="text-xs text-danger">
                {t(errors.amountPaid.message!)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-border bg-surface-muted px-3 py-3">
          <p className="text-xs font-medium tracking-wide text-text-secondary uppercase">
            {t("debts.calculation")}
          </p>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-text-secondary">
              {t("debts.interestDueThisPeriod")}
            </span>
            <span className="font-medium text-text-main tabular-nums">
              {formatMoney(expectedInterest, currency)}
            </span>
          </div>

          {amountNum > 0 ? (
            <>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-text-secondary">{t("debts.amountPaid")}</span>
                <span className="font-medium text-primary tabular-nums">
                  {formatMoney(amountNum, currency)}
                </span>
              </div>

              {amortization > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text-secondary">
                      {t("debts.amortizationToPrincipal")}
                    </span>
                    <span className="font-medium text-success tabular-nums">
                      {formatMoney(amortization, currency)}
                    </span>
                  </div>
                  <div className="rounded-md border border-border bg-surface px-3 py-2.5">
                    <p className="text-xs text-text-secondary">
                      {t("debts.principalAfterThisPayment")}
                    </p>
                    <p className="mt-0.5 font-headline text-sm font-semibold text-text-main tabular-nums">
                      {formatMoney(principalAfter, currency)}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {t("debts.principalAfterHint")}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-text-secondary">
                  {t("debts.payingHint", {
                    amount: formatMoney(expectedInterest, currency),
                  })}
                </p>
              )}
            </>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            className="text-sm font-medium text-text-main"
            htmlFor="debt-payment-description"
          >
            {t("common.descriptionOptional")}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="debt-payment-description"
                rows={3}
                className={cn(
                  "w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none",
                  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
                  errors.description && "border-danger",
                )}
                placeholder={t("common.descriptionPlaceholder")}
              />
            )}
          />
          {errors.description ? (
            <p className="text-xs text-danger">
              {t(errors.description.message!)}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <p className="text-sm text-danger" role="alert">
            {submitError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
