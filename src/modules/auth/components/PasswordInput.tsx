"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

type PasswordInputProps = {
  name: string;
  label: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
};

/**
 * Campo de contraseña con icono lock + toggle de visibilidad (Stitch / Lucide).
 */
export function PasswordInput({
  name,
  label,
  autoComplete = "current-password",
  placeholder = "••••••••",
  required = true,
}: PasswordInputProps) {
  const { t } = useTranslation();
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor={id} className="font-medium text-text-main">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-background py-2.5 pr-10 pl-10 text-text-main outline-none ring-ring placeholder:text-text-secondary focus:ring-2"
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute top-1/2 right-2.5 z-10 -translate-y-1/2 cursor-pointer rounded p-0.5 text-text-secondary hover:text-text-main"
          aria-label={
            showPassword ? t("login.hidePassword") : t("login.showPassword")
          }
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
