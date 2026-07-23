"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ClientApiError } from "@/shared/api/apiFetch";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import { cashRegisterQueryKeys } from "../hooks/useCashRegisterSummary";
import {
  createWithdrawFormSchema,
  type WithdrawFormValues,
} from "../schemas/withdrawFormSchema";
import { postWithdraw } from "../services/cashRegisterActions";

const fieldClass = cn(
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none",
  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
);

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
};

export function WithdrawModal({
  open,
  onClose,
  currentBalance,
}: WithdrawModalProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const schema = useMemo(
    () => createWithdrawFormSchema(currentBalance),
    [currentBalance],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", reason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ amount: "", reason: "" });
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: WithdrawFormValues) =>
      postWithdraw({
        amount: parseFloat(values.amount.replace(/,/g, ".")) || 0,
        reason: values.reason.trim(),
        currency,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cashRegisterQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
      onClose();
    },
  });

  const errorMessage =
    mutation.error instanceof ClientApiError
      ? mutation.error.message === "INSUFFICIENT_BALANCE"
        ? t("cashRegister.insufficientBalance")
        : mutation.error.message
      : t("cashRegister.withdrawError");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("cashRegister.withdraw")}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="cash-withdraw-form"
            variant="danger"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("common.loading")
              : t("common.confirmWithdrawal")}
          </Button>
        </>
      }
    >
      <form
        id="cash-withdraw-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <p className="text-sm text-text-secondary">
          {t("cashRegister.currentBalance")}:{" "}
          <span className="font-medium text-text-main">
            {formatMoney(currentBalance, currency)}
          </span>
        </p>

        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text-main">
                {t("cashRegister.formAmount")} ({currency})
              </span>
              <input
                {...field}
                inputMode="decimal"
                placeholder="0.00"
                className={fieldClass}
              />
              {errors.amount ? (
                <span className="text-xs text-danger">
                  {t(errors.amount.message!)}
                </span>
              ) : null}
            </label>
          )}
        />

        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text-main">
                {t("cashRegister.formReasonRequired")}
              </span>
              <textarea
                {...field}
                rows={3}
                placeholder={t("cashRegister.placeholderReason")}
                className={cn(fieldClass, "h-auto min-h-[5rem] py-2")}
              />
              {errors.reason ? (
                <span className="text-xs text-danger">
                  {t(errors.reason.message!)}
                </span>
              ) : null}
            </label>
          )}
        />

        {mutation.isError ? (
          <p className="text-sm text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
