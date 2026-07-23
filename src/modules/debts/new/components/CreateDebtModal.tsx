"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button/Button";
import { Modal } from "@/shared/components/Modal";
import {
  currencyOptions,
  useCurrency,
  type CurrencyCode,
} from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import { debtsQueryKeys } from "../../hooks/useDebtsOverview";
import { createDebt } from "../../services/createDebt";
import {
  createDebtFormSchema,
  type CreateDebtFormValues,
} from "../schemas/createDebtFormSchema";

const fieldClass = cn(
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none",
  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextMonthSameDay(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

type CreateDebtModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateDebtModal({ open, onClose }: CreateDebtModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currency: headerCurrency } = useCurrency();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateDebtFormValues>({
    resolver: zodResolver(createDebtFormSchema),
    defaultValues: {
      lender: "",
      amount: "",
      interestRate: "",
      currency: headerCurrency,
      issueDate: todayISO(),
      nextPaymentDate: nextMonthSameDay(todayISO()),
      description: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const today = todayISO();
    reset({
      lender: "",
      amount: "",
      interestRate: "",
      currency: headerCurrency,
      issueDate: today,
      nextPaymentDate: nextMonthSameDay(today),
      description: "",
    });
  }, [open, headerCurrency, reset]);

  const amountStr = useWatch({ control, name: "amount" }) ?? "";
  const interestRateStr = useWatch({ control, name: "interestRate" }) ?? "";
  const currency = (useWatch({ control, name: "currency" }) ??
    headerCurrency) as CurrencyCode;

  const amountNum = useMemo(
    () => parseFloat(amountStr.replace(/,/g, ".")) || 0,
    [amountStr],
  );
  const interestRateNum = useMemo(
    () => parseFloat(interestRateStr.replace(/,/g, ".")) || 0,
    [interestRateStr],
  );
  const interestAmount = amountNum * (interestRateNum / 100);
  const nextPaymentAmount = amountNum + interestAmount;

  const mutation = useMutation({
    mutationFn: (values: CreateDebtFormValues) =>
      createDebt({
        lender: values.lender.trim(),
        initialAmount: parseFloat(values.amount.replace(/,/g, ".")) || 0,
        interestRate: parseFloat(values.interestRate.replace(/,/g, ".")) || 0,
        currency: values.currency,
        issueDate: values.issueDate,
        nextPaymentDate: values.nextPaymentDate,
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("debts.newDebt")}
      className="max-w-xl"
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
            form="create-debt-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t("common.loading") : t("debts.createDebt")}
          </Button>
        </>
      }
    >
      <form
        id="create-debt-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-main" htmlFor="debt-lender">
            {t("debts.formLender")}
          </label>
          <Controller
            name="lender"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="debt-lender"
                className={cn(fieldClass, errors.lender && "border-danger")}
                placeholder={t("debts.formLenderPlaceholder")}
              />
            )}
          />
          {errors.lender ? (
            <p className="text-xs text-danger">{t(errors.lender.message!)}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-main" htmlFor="debt-amount">
              {t("debts.formAmount")}
            </label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="debt-amount"
                  inputMode="decimal"
                  className={cn(fieldClass, errors.amount && "border-danger")}
                  placeholder={t("debts.placeholderAmount")}
                />
              )}
            />
            {errors.amount ? (
              <p className="text-xs text-danger">{t(errors.amount.message!)}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-main" htmlFor="debt-currency">
              {t("debts.formCurrency")}
            </label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <select {...field} id="debt-currency" className={fieldClass}>
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-main" htmlFor="debt-rate">
              {t("debts.formInterestRate")}
            </label>
            <Controller
              name="interestRate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="debt-rate"
                  inputMode="decimal"
                  className={cn(
                    fieldClass,
                    errors.interestRate && "border-danger",
                  )}
                  placeholder={t("debts.placeholderInterest")}
                />
              )}
            />
            {errors.interestRate ? (
              <p className="text-xs text-danger">
                {t(errors.interestRate.message!)}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-text-main">
              {t("debts.formInterestAmount")}
            </p>
            <div className="flex h-10 items-center rounded-md border border-border bg-surface-muted px-3 text-sm font-medium text-text-main">
              {formatMoney(interestAmount, currency)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-main" htmlFor="debt-issue-date">
              {t("debts.formIssueDate")}
            </label>
            <Controller
              name="issueDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="debt-issue-date"
                  type="date"
                  className={cn(fieldClass, errors.issueDate && "border-danger")}
                  onChange={(event) => {
                    field.onChange(event);
                    const issue = event.target.value;
                    if (issue) {
                      setValue("nextPaymentDate", nextMonthSameDay(issue), {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              )}
            />
            {errors.issueDate ? (
              <p className="text-xs text-danger">{t(errors.issueDate.message!)}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-text-main"
              htmlFor="debt-next-payment"
            >
              {t("debts.formNextPaymentDate")}
            </label>
            <Controller
              name="nextPaymentDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="debt-next-payment"
                  type="date"
                  className={cn(
                    fieldClass,
                    errors.nextPaymentDate && "border-danger",
                  )}
                />
              )}
            />
            {errors.nextPaymentDate ? (
              <p className="text-xs text-danger">
                {t(errors.nextPaymentDate.message!)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface-muted px-3 py-2.5">
          <p className="text-xs text-text-secondary">{t("debts.formNextPayment")}</p>
          <p className="mt-0.5 font-headline text-sm font-semibold text-text-main">
            {formatMoney(nextPaymentAmount, currency)}
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-sm font-medium text-text-main"
            htmlFor="debt-description"
          >
            {t("common.descriptionOptional")}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="debt-description"
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
            {t("debts.createError")}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
