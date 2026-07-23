"use client";

import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  currencyOptions,
  getCurrencyOption,
  useCurrency,
} from "@/shared/currency";
import { PortalMenu } from "@/shared/components/PortalMenu";
import { cn } from "@/shared/utils/cn";

export function CurrencySelector() {
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const selectedOption = getCurrencyOption(currency);

  return (
    <PortalMenu
      widthClassName="w-40"
      trigger={({ open, toggle, triggerProps }) => (
        <button
          type="button"
          {...triggerProps}
          onClick={toggle}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm font-semibold text-text-main",
            "hover:border-primary/40 hover:text-primary",
            open && "border-primary/40 text-primary",
          )}
          aria-label={t("shell.selectCurrency")}
        >
          <span>{selectedOption.shortLabel}</span>
          <ChevronDown className="size-4 text-text-secondary" aria-hidden />
        </button>
      )}
    >
      {({ close }) => (
        <ul className="py-1" role="none">
          {currencyOptions.map((option) => {
            const selected = option.code === currency;

            return (
              <li key={option.code} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className={cn(
                    "flex w-full cursor-pointer px-3 py-2 text-left text-sm",
                    selected
                      ? "bg-primary-light font-medium text-primary"
                      : "text-text-main hover:bg-surface-muted",
                  )}
                  onClick={() => {
                    setCurrency(option.code);
                    close();
                  }}
                >
                  {t(option.labelKey)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PortalMenu>
  );
}
