"use client";

import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";

import type { ClientListItem } from "@/modules/clients/types";
import { cn } from "@/shared/utils/cn";

type ClientAutocompleteProps = {
  clients: ClientListItem[];
  value: string;
  onChange: (clientId: string) => void;
  id?: string;
  className?: string;
  /** When true (default), includes “All clients” empty option. */
  allowAll?: boolean;
  emptyLabel?: string;
  onCreateNew?: () => void;
  createNewLabel?: string;
  error?: boolean;
};

export function ClientAutocomplete({
  clients,
  value,
  onChange,
  id,
  className,
  allowAll = true,
  emptyLabel,
  onCreateNew,
  createNewLabel,
  error = false,
}: ClientAutocompleteProps) {
  const { t } = useTranslation();
  const listboxId = useId();
  const generatedInputId = useId();
  const inputId = id ?? generatedInputId;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const allLabel = emptyLabel ?? t("loans.allClients");
  const newLabel = createNewLabel ?? t("loans.newClient");

  const selected = useMemo(
    () => clients.find((client) => client.id === value) ?? null,
    [clients, value],
  );

  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? clients.filter((client) =>
          client.displayName.toLowerCase().includes(normalized),
        )
      : clients;

    const rows = filtered.map((client) => ({
      id: client.id,
      displayName: client.displayName,
    }));

    if (allowAll) {
      return [{ id: "", displayName: allLabel }, ...rows];
    }

    return rows;
  }, [allowAll, allLabel, clients, query]);

  const noMatches =
    Boolean(query.trim()) &&
    options.filter((option) => option.id !== "").length === 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const displayValue = open
    ? query
    : (selected?.displayName ?? (allowAll ? allLabel : ""));

  function selectOption(clientId: string) {
    onChange(clientId);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!open) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        index + 1 >= options.length ? 0 : index + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index - 1 < 0 ? Math.max(options.length - 1, 0) : index - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) {
        selectOption(option.id);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={error || undefined}
          aria-activedescendant={
            open && options[activeIndex]
              ? `${listboxId}-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          value={displayValue}
          placeholder={t("loans.formSelectClient")}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-10 w-full rounded-md border bg-surface py-2 pr-10 pl-9 text-sm text-text-main outline-none",
            "placeholder:text-text-secondary",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            error ? "border-danger" : "border-border",
          )}
        />
        <ChevronsUpDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
      </div>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-52 overflow-y-auto py-1"
          >
            {options.map((option, index) => {
              const selectedOption = option.id === value;
              const active = index === activeIndex;

              return (
                <li
                  key={option.id || "all"}
                  role="option"
                  aria-selected={selectedOption}
                >
                  <button
                    type="button"
                    id={`${listboxId}-${index}`}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                      active && "bg-surface-muted",
                      selectedOption
                        ? "bg-primary-light font-medium text-primary"
                        : "text-text-main hover:bg-surface-muted",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option.id)}
                  >
                    <span className="truncate">{option.displayName}</span>
                    {selectedOption ? (
                      <Check
                        className="size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
            {noMatches || (options.length === 0 && !allowAll) ? (
              <li className="px-3 py-2.5 text-sm text-text-secondary">
                {t("loans.noClientsMatch")}
              </li>
            ) : null}
          </ul>

          {onCreateNew ? (
            <div className="border-t border-border p-1">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-light"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  onCreateNew();
                }}
              >
                <Plus className="size-4" aria-hidden />
                {newLabel}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
