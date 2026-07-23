"use client";

import { Moon, Sun } from "lucide-react";

import { cn } from "@/shared/utils/cn";

export type ThemeSwitchProps = {
  value: "light" | "dark";
  onChange: (value: "light" | "dark") => void;
  label: string;
  description?: string;
};

/**
 * Switch de tema: sol (light) a la izquierda, luna (dark) a la derecha.
 */
export function ThemeSwitch({
  value,
  onChange,
  label,
  description,
}: ThemeSwitchProps) {
  const isDark = value === "dark";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-main">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Sun
          className={cn(
            "size-4 transition-colors",
            isDark ? "text-text-secondary" : "text-primary",
          )}
          aria-hidden
        />

        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={label}
          onClick={() => onChange(isDark ? "light" : "dark")}
          className={cn(
            "relative h-7 w-12 cursor-pointer rounded-full transition-colors",
            isDark ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-6 rounded-full bg-surface shadow transition-transform",
              isDark && "translate-x-5",
            )}
          />
        </button>

        <Moon
          className={cn(
            "size-4 transition-colors",
            isDark ? "text-primary" : "text-text-secondary",
          )}
          aria-hidden
        />
      </div>
    </div>
  );
}
