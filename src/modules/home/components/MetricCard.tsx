"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";

export type MetricCardTone = "default" | "danger";

export type MetricCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: MetricCardTone;
  iconClassName?: string;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  iconClassName,
}: MetricCardProps) {
  const isDanger = tone === "danger";

  return (
    <article
      className={cn(
        "rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md",
        isDanger
          ? "border-danger/20 bg-danger/10"
          : "border-border bg-surface",
      )}
    >
      <div
        className={cn(
          "mb-1.5 flex items-center gap-2",
          isDanger ? "text-danger" : "text-text-secondary",
        )}
      >
        <Icon
          className={cn("size-4 shrink-0", iconClassName)}
          aria-hidden
        />
        <span className="text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "font-headline text-xl font-semibold tracking-tight",
          isDanger ? "text-danger" : "text-text-main",
        )}
      >
        {value}
      </p>
    </article>
  );
}
