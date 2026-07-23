"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button/Button";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import { loansQueryKeys } from "../../hooks/useLoansOverview";
import { createLoanPayment } from "../../services/createPayment";
import type { LoanDetail } from "../../types";
import {
  createRegisterPaymentFormSchema,
  type RegisterPaymentFormValues,
} from "../schemas/registerPaymentFormSchema";

const fieldClass = cn(
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none",
  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type RegisterPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  loan: LoanDetail;
};

export function RegisterPaymentModal({
  open,
  onClose,
  loan,
}: RegisterPaymentModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const expectedInterest = useMemo(
    () => (loan.currentPrincipal * loan.interestRate) / 100,
    [loan.currentPrincipal, loan.interestRate],
  );

  const schema = useMemo(
    () => createRegisterPaymentFormSchema(expectedInterest),
    [expectedInterest],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterPaymentFormValues>({
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
  }, [open, reset, loan.id]);

  const amountPaidStr = useWatch({ control, name: "amountPaid" }) ?? "";
  const amountNum = parseFloat(amountPaidStr.replace(/,/g, ".")) || 0;
  const amortization = Math.max(0, amountNum - expectedInterest);
  const principalAfter = Math.max(0, loan.currentPrincipal - amortization);
  const currency = loan.currency || "USD";

  const mutation = useMutation({
    mutationFn: (values: RegisterPaymentFormValues) =>
      createLoanPayment(loan.id, {
        paymentDate: values.paymentDate,
        amountPaid: parseFloat(values.amountPaid.replace(/,/g, ".")) || 0,
        description: values.description?.trim() || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loansQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["cash-register"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("loans.registerPayment")}
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
            form="register-payment-form"
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
        id="register-payment-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-text-main"
              htmlFor="payment-date"
            >
              {t("loans.paymentDateLabel")}
            </label>
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="payment-date"
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
              htmlFor="payment-amount"
            >
              {t("loans.amountPaid")}
            </label>
            <div className="relative">
              <Controller
                name="amountPaid"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="payment-amount"
                    inputMode="decimal"
                    className={cn(
                      fieldClass,
                      "pr-16",
                      errors.amountPaid && "border-danger",
                    )}
                    placeholder={t("loans.placeholderAmount")}
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
            {t("loans.calculation")}
          </p>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-text-secondary">
              {t("loans.interestDueThisPeriod")}
            </span>
            <span className="font-medium text-text-main tabular-nums">
              {formatMoney(expectedInterest, currency)}
            </span>
          </div>

          {amountNum > 0 ? (
            <>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-text-secondary">{t("loans.amountPaid")}</span>
                <span className="font-medium text-primary tabular-nums">
                  {formatMoney(amountNum, currency)}
                </span>
              </div>

              {amortization > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text-secondary">
                      {t("loans.amortizationToPrincipal")}
                    </span>
                    <span className="font-medium text-success tabular-nums">
                      {formatMoney(amortization, currency)}
                    </span>
                  </div>
                  <div className="rounded-md border border-border bg-surface px-3 py-2.5">
                    <p className="text-xs text-text-secondary">
                      {t("loans.principalAfterThisPayment")}
                    </p>
                    <p className="mt-0.5 font-headline text-sm font-semibold text-text-main tabular-nums">
                      {formatMoney(principalAfter, currency)}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {t("loans.principalAfterHint")}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-text-secondary">
                  {t("loans.payingHint", {
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
            htmlFor="payment-description"
          >
            {t("common.descriptionOptional")}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="payment-description"
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

        {mutation.isError ? (
          <p className="text-sm text-danger" role="alert">
            {t("loans.paymentRegisterError")}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
