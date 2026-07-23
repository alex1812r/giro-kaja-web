"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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
  depositFormSchema,
  type DepositFormValues,
} from "../schemas/depositFormSchema";
import { postDeposit } from "../services/cashRegisterActions";

const fieldClass = cn(
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none",
  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
);

type DepositModalProps = {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
};

export function DepositModal({
  open,
  onClose,
  currentBalance,
}: DepositModalProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: { amount: "", note: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ amount: "", note: "" });
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: DepositFormValues) =>
      postDeposit({
        amount: parseFloat(values.amount.replace(/,/g, ".")) || 0,
        note: values.note?.trim() || null,
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("cashRegister.deposit")}
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
            form="cash-deposit-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("common.loading")
              : t("common.confirmDeposit")}
          </Button>
        </>
      }
    >
      <form
        id="cash-deposit-form"
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
          name="note"
          render={({ field }) => (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text-main">
                {t("cashRegister.formNoteOptional")}
              </span>
              <textarea
                {...field}
                rows={3}
                placeholder={t("cashRegister.placeholderNote")}
                className={cn(fieldClass, "h-auto min-h-[5rem] py-2")}
              />
            </label>
          )}
        />

        {mutation.isError ? (
          <p className="text-sm text-danger" role="alert">
            {mutation.error instanceof ClientApiError
              ? mutation.error.message
              : t("cashRegister.depositError")}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
