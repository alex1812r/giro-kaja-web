"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { clientsQueryKeys } from "@/modules/clients/hooks/useClientsList";
import { createClient } from "@/modules/clients/services/createClient";
import type { ClientListItem } from "@/modules/clients/types";
import { Button } from "@/shared/components/Button/Button";
import { Modal } from "@/shared/components/Modal";
import { cn } from "@/shared/utils/cn";

import {
  createClientFormSchema,
  type CreateClientFormValues,
} from "../schemas/createClientFormSchema";

const fieldClass = cn(
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-main outline-none",
  "placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20",
);

type CreateClientModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (client: ClientListItem) => void;
};

export function CreateClientModal({
  open,
  onClose,
  onCreated,
}: CreateClientModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ firstName: "", lastName: "", phone: "" });
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: CreateClientFormValues) =>
      createClient({
        name: values.firstName.trim(),
        lastName: values.lastName?.trim() || undefined,
        phone: values.phone.trim(),
      }),
    onSuccess: (client) => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
      onCreated(client);
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("loans.newClient")}
      overlayClassName="z-[60]"
      className="max-w-md"
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
            form="create-client-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t("common.loading") : t("common.save")}
          </Button>
        </>
      }
    >
      <form
        id="create-client-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-main" htmlFor="client-first-name">
            {t("loans.formClientFirstName")}
          </label>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="client-first-name"
                className={cn(fieldClass, errors.firstName && "border-danger")}
                placeholder={t("loans.placeholderClientName")}
                autoComplete="given-name"
              />
            )}
          />
          {errors.firstName ? (
            <p className="text-xs text-danger">{t(errors.firstName.message!)}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-main" htmlFor="client-last-name">
            {t("loans.formClientLastName")}
          </label>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="client-last-name"
                className={fieldClass}
                placeholder={t("loans.placeholderClientLastName")}
                autoComplete="family-name"
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-main" htmlFor="client-phone">
            {t("loans.formClientPhone")}
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="client-phone"
                className={cn(fieldClass, errors.phone && "border-danger")}
                placeholder={t("loans.placeholderClientPhone")}
                autoComplete="tel"
              />
            )}
          />
          {errors.phone ? (
            <p className="text-xs text-danger">{t(errors.phone.message!)}</p>
          ) : null}
        </div>

        {mutation.isError ? (
          <p className="text-sm text-danger" role="alert">
            {t("loans.clientCreateError")}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
