"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

import { useCreateAdminUser } from "../hooks/useAdminUsers";

type CreateAdminUserModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateAdminUserModal({
  open,
  onClose,
}: CreateAdminUserModalProps) {
  const { t } = useTranslation();
  const createUser = useCreateAdminUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    createUser.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await createUser.mutateAsync({ name, email, password });
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("admin.createAdminTitle")}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="create-admin-user-form"
            disabled={createUser.isPending}
          >
            {createUser.isPending
              ? t("admin.creatingAdmin")
              : t("admin.createAdmin")}
          </Button>
        </div>
      }
    >
      <form
        id="create-admin-user-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-main">{t("admin.formName")}</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-md border border-border bg-surface px-3"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-main">{t("admin.formEmail")}</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 rounded-md border border-border bg-surface px-3"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-main">
            {t("admin.formPassword")}
          </span>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-md border border-border bg-surface px-3"
          />
        </label>
        {createUser.error ? (
          <p className="text-sm text-danger">{createUser.error.message}</p>
        ) : null}
      </form>
    </Modal>
  );
}
