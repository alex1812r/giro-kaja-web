import { type HTMLAttributes } from "react";

import { cn } from "@/shared/utils/cn";

export type SkeletonVariant = "block" | "text" | "circle";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant;
};

export function Skeleton({
  className,
  variant = "block",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-surface-muted",
        variant === "block" && "h-10 rounded-lg",
        variant === "text" && "h-4 rounded-full",
        variant === "circle" && "size-10 rounded-full",
        className,
      )}
      {...props}
    />
  );
}
