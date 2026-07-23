"use client";

import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type AuthCardProps = {
  /** Marca + tagline (Giro Kaja). Por defecto visible; oculto en forgot/reset. */
  showBrand?: boolean;
  /** Título de la pantalla debajo de la marca (ej. Recuperar contraseña). */
  heading?: string;
  /** Texto de apoyo bajo el heading o la marca. */
  description?: string;
  children: ReactNode;
  /** Pie bajo la card. `null` lo oculta. Por defecto: Acceso seguro. */
  footer?: ReactNode | null;
};

/**
 * Shell visual compartido de auth (login, recuperar clave, nueva clave).
 * Card centrada ~420px; marca opcional vía `showBrand`.
 */
export function AuthCard({
  showBrand = true,
  heading,
  description,
  children,
  footer,
}: AuthCardProps) {
  const { t } = useTranslation();

  const resolvedFooter =
    footer === undefined ? (
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium tracking-wide text-text-secondary uppercase">
        <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
        {t("brand.secureAccess")}
      </p>
    ) : (
      footer
    );

  const hasHeader = showBrand || Boolean(heading) || Boolean(description);

  return (
    <div className="gk-auth-shell flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        {hasHeader ? (
          <header className="mb-6 text-center">
            {showBrand ? (
              <>
                <p className="font-headline text-3xl font-bold tracking-tight text-primary">
                  {t("brand.name")}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{t("brand.tagline")}</p>
              </>
            ) : null}

            {heading ? (
              <h1
                className={
                  showBrand
                    ? "font-headline mt-5 text-xl font-semibold text-text-main"
                    : "font-headline text-xl font-semibold text-text-main"
                }
              >
                {heading}
              </h1>
            ) : null}

            {description ? (
              <p
                className={
                  heading || showBrand
                    ? "mt-2 text-sm text-text-secondary"
                    : "text-sm text-text-secondary"
                }
              >
                {description}
              </p>
            ) : null}
          </header>
        ) : null}

        {children}
      </div>

      {resolvedFooter}
    </div>
  );
}
