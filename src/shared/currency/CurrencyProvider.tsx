"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type CurrencyCode,
  currencyStorageKey,
  isCurrencyCode,
} from "./currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const defaultCurrency: CurrencyCode = "USD";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Mismo valor en SSR y primer paint del cliente (evitar hydration mismatch).
  const [currency, setCurrencyState] = useState<CurrencyCode>(defaultCurrency);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(currencyStorageKey);
      if (stored && isCurrencyCode(stored)) {
        setCurrencyState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      window.localStorage.setItem(currencyStorageKey, code);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency }),
    [currency, setCurrency],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider.");
  }

  return context;
}
