"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ClientApiError } from "@/shared/api/apiFetch";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import {
  currencyOptions,
  useCurrency,
  type CurrencyCode,
} from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import { cashRegisterQueryKeys } from "../hooks/useCashRegisterSummary";
import {
  createTransferFormSchema,
  type TransferFormValues,
} from "../schemas/transferFormSchema";
import {
  fetchVaultBalances,
  postTransfer,
} from "../services/cashRegisterActions";

const fieldClass = cn(
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none",
  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
);

type TransferModalProps = {
  open: boolean;
  onClose: () => void;
};

export function TransferModal({ open, onClose }: TransferModalProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const schema = useMemo(() => createTransferFormSchema(), []);

  const balancesQuery = useQuery({
    queryKey: [...cashRegisterQueryKeys.all, "balances"] as const,
    enabled: open,
    queryFn: async () => {
      const data = await fetchVaultBalances();
      return data.balances;
    },
  });

  const defaultTo =
    currencyOptions.find((o) => o.code !== currency)?.code ?? "EUR";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromCurrency: currency,
      toCurrency: defaultTo,
      amount: "",
    },
  });

  useEffect(() => {
    if (open) {
      const to = currencyOptions.find((o) => o.code !== currency)?.code ?? "EUR";
      reset({
        fromCurrency: currency,
        toCurrency: to,
        amount: "",
      });
    }
  }, [open, reset, currency]);

  const fromCurrency = useWatch({ control, name: "fromCurrency" });
  const toCurrency = useWatch({ control, name: "toCurrency" });
  const fromBalance = balancesQuery.data?.[fromCurrency] ?? 0;

  const mutation = useMutation({
    mutationFn: (values: TransferFormValues) => {
      const amount = parseFloat(values.amount.replace(/,/g, ".")) || 0;
      if (amount > (balancesQuery.data?.[values.fromCurrency] ?? 0)) {
        throw new ClientApiError(
          400,
          "BAD_REQUEST",
          "INSUFFICIENT_BALANCE",
        );
      }
      return postTransfer({
        fromCurrency: values.fromCurrency,
        toCurrency: values.toCurrency,
        amount,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cashRegisterQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
      onClose();
    },
  });

  function mapError(error: unknown): string {
    if (!(error instanceof ClientApiError)) {
      return t("cashRegister.transferError");
    }
    switch (error.message) {
      case "SAME_CURRENCY":
        return t("cashRegister.transferErrorSameCurrency");
      case "INSUFFICIENT_BALANCE":
        return t("cashRegister.transferErrorInsufficient");
      case "INVALID_AMOUNT":
        return t("cashRegister.transferErrorInvalidAmount");
      default:
        return error.message || t("cashRegister.transferError");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("cashRegister.transferTitle")}
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
            form="cash-transfer-form"
            disabled={mutation.isPending || balancesQuery.isLoading}
          >
            {mutation.isPending
              ? t("common.loading")
              : t("cashRegister.transferConfirm")}
          </Button>
        </>
      }
    >
      <form
        id="cash-transfer-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="fromCurrency"
            render={({ field }) => (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-text-main">
                  {t("cashRegister.transferFrom")}
                </span>
                <select
                  {...field}
                  className={fieldClass}
                  onChange={(e) => {
                    const next = e.target.value as CurrencyCode;
                    field.onChange(next);
                    if (next === toCurrency) {
                      const alt =
                        currencyOptions.find((o) => o.code !== next)?.code ??
                        "USD";
                      setValue("toCurrency", alt);
                    }
                  }}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          />

          <Controller
            control={control}
            name="toCurrency"
            render={({ field }) => (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-text-main">
                  {t("cashRegister.transferTo")}
                </span>
                <select
                  {...field}
                  className={fieldClass}
                  onChange={(e) => {
                    const next = e.target.value as CurrencyCode;
                    field.onChange(next);
                    if (next === fromCurrency) {
                      const alt =
                        currencyOptions.find((o) => o.code !== next)?.code ??
                        "EUR";
                      setValue("fromCurrency", alt);
                    }
                  }}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
                {errors.toCurrency ? (
                  <span className="text-xs text-danger">
                    {t(errors.toCurrency.message!)}
                  </span>
                ) : null}
              </label>
            )}
          />
        </div>

        <p className="text-xs text-text-secondary">
          {t("cashRegister.transferAvailable", {
            amount: formatMoney(fromBalance, fromCurrency),
          })}
        </p>

        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text-main">
                {t("cashRegister.transferAmount")}
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

        {mutation.isError ? (
          <p className="text-sm text-danger" role="alert">
            {mapError(mutation.error)}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
