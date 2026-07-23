"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/utils/cn";

type PortalMenuProps = {
  trigger: (args: {
    open: boolean;
    toggle: () => void;
    triggerProps: {
      "aria-expanded": boolean;
      "aria-haspopup": "menu";
      id: string;
      ref: (node: HTMLButtonElement | null) => void;
    };
  }) => ReactNode;
  children: (args: { close: () => void }) => ReactNode;
  align?: "end" | "start";
  menuClassName?: string;
  widthClassName?: string;
};

/**
 * Menú anclado al trigger, renderizado en portal (profile / notificaciones).
 */
export function PortalMenu({
  trigger,
  children,
  align = "end",
  menuClassName,
  widthClassName = "w-72",
}: PortalMenuProps) {
  const triggerId = useId();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 288;
    const left =
      align === "end"
        ? Math.max(8, rect.right - menuWidth)
        : Math.max(8, rect.left);

    setCoords({
      top: rect.bottom + 8,
      left,
    });
  }, [align]);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, updatePosition]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((value) => !value);

  return (
    <>
      {trigger({
        open,
        toggle,
        triggerProps: {
          id: triggerId,
          ref: (node) => {
            triggerRef.current = node;
          },
          "aria-expanded": open,
          "aria-haspopup": "menu",
        },
      })}

      {mounted && open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-labelledby={triggerId}
              className={cn(
                "fixed z-50 rounded-xl border border-border bg-surface shadow-lg",
                widthClassName,
                menuClassName,
              )}
              style={{ top: coords.top, left: coords.left }}
            >
              {children({ close })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
