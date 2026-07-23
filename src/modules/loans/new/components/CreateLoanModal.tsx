"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useClientsList } from "@/modules/clients/hooks/useClientsList";
import type { ClientListItem } from "@/modules/clients/types";
import { ClientApiError } from "@/shared/api/apiFetch";
import { Button } from "@/shared/components/Button/Button";
import { ClientAutocomplete } from "@/shared/components/ClientAutocomplete";
import { Modal } from "@/shared/components/Modal";
import {
  currencyOptions,
  useCurrency,
  type CurrencyCode,
} from "@/shared/currency";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

import { loansQueryKeys } from "../../hooks/useLoansOverview";
import { createLoan } from "../../services/createLoan";
import {
  createLoanFormSchema,
  type CreateLoanFormValues,
} from "../schemas/createLoanFormSchema";
import { CreateClientModal } from "./CreateClientModal";

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

type CreateLoanModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateLoanModal({ open, onClose }: CreateLoanModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currency: headerCurrency } = useCurrency();
  const { data: fetchedClients = [] } = useClientsList();
  const [addedClients, setAddedClients] = useState<ClientListItem[]>([]);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const clientFieldId = useId();

  const clients = useMemo(() => {
    const map = new Map<string, ClientListItem>();
    for (const client of [...fetchedClients, ...addedClients]) {
      map.set(client.id, client);
    }
    return Array.from(map.values());
  }, [fetchedClients, addedClients]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateLoanFormValues>({
    resolver: zodResolver(createLoanFormSchema),
    defaultValues: {
      clientId: "",
      clientName: "",
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
      clientId: "",
      clientName: "",
      amount: "",
      interestRate: "",
      currency: headerCurrency,
      issueDate: today,
      nextPaymentDate: nextMonthSameDay(today),
      description: "",
    });
    setAddedClients([]);
    setCreateClientOpen(false);
  }, [open, headerCurrency, reset]);

  const clientId = useWatch({ control, name: "clientId" }) ?? "";
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
    mutationFn: (values: CreateLoanFormValues) =>
      createLoan({
        clientId: values.clientId,
        initialAmount: parseFloat(values.amount.replace(/,/g, ".")) || 0,
        interestRate: parseFloat(values.interestRate.replace(/,/g, ".")) || 0,
        currency: values.currency as CurrencyCode,
        issueDate: values.issueDate,
        nextPaymentDate: values.nextPaymentDate,
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

  const submitError =
    mutation.error instanceof ClientApiError &&
    mutation.error.code === "INSUFFICIENT_BALANCE"
      ? t("loans.insufficientBalance")
      : mutation.isError
        ? t("loans.createError")
        : null;

  function handleClientChange(clientId: string) {
    const client = clients.find((item) => item.id === clientId);
    setValue("clientId", clientId, { shouldValidate: true });
    setValue("clientName", client?.displayName ?? "", { shouldValidate: true });
  }

  function handleClientCreated(client: ClientListItem) {
    setAddedClients((prev) => [...prev, client]);
    setValue("clientId", client.id, { shouldValidate: true });
    setValue("clientName", client.displayName, { shouldValidate: true });
  }

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          if (createClientOpen) {
            return;
          }
          onClose();
        }}
        title={t("loans.newLoan")}
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
              form="create-loan-form"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? t("common.loading") : t("loans.createLoan")}
            </Button>
          </>
        }
      >
        <form
          id="create-loan-form"
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-text-main"
              htmlFor={clientFieldId}
            >
              {t("loans.formClient")}
            </label>
            <ClientAutocomplete
              id={clientFieldId}
              clients={clients}
              value={clientId}
              onChange={handleClientChange}
              allowAll={false}
              onCreateNew={() => setCreateClientOpen(true)}
              error={Boolean(errors.clientId || errors.clientName)}
            />
            {errors.clientId || errors.clientName ? (
              <p className="text-xs text-danger">{t("validation.required")}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main" htmlFor="loan-amount">
                {t("loans.formAmount")}
              </label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="loan-amount"
                    inputMode="decimal"
                    className={cn(fieldClass, errors.amount && "border-danger")}
                    placeholder={t("loans.placeholderAmount")}
                  />
                )}
              />
              {errors.amount ? (
                <p className="text-xs text-danger">{t(errors.amount.message!)}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main" htmlFor="loan-currency">
                {t("loans.formCurrency")}
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="loan-currency"
                    className={fieldClass}
                  >
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
              <label className="text-sm font-medium text-text-main" htmlFor="loan-rate">
                {t("loans.formInterestRate")}
              </label>
              <Controller
                name="interestRate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="loan-rate"
                    inputMode="decimal"
                    className={cn(
                      fieldClass,
                      errors.interestRate && "border-danger",
                    )}
                    placeholder={t("loans.placeholderInterest")}
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
                {t("loans.formInterestAmount")}
              </p>
              <div className="flex h-10 items-center rounded-md border border-border bg-surface-muted px-3 text-sm font-medium text-text-main">
                {formatMoney(interestAmount, currency)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main" htmlFor="loan-issue-date">
                {t("loans.formIssueDate")}
              </label>
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="loan-issue-date"
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
              <label className="text-sm font-medium text-text-main" htmlFor="loan-next-payment">
                {t("loans.formNextPaymentDate")}
              </label>
              <Controller
                name="nextPaymentDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="loan-next-payment"
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
            <p className="text-xs text-text-secondary">{t("loans.formNextPayment")}</p>
            <p className="mt-0.5 font-headline text-sm font-semibold text-text-main">
              {formatMoney(nextPaymentAmount, currency)}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-main" htmlFor="loan-description">
              {t("common.descriptionOptional")}
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="loan-description"
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

      <CreateClientModal
        open={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        onCreated={handleClientCreated}
      />
    </>
  );
}
