"use client";

import { type ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import {
  detectStoredLocale,
  i18n,
  initI18n,
  setLocale,
  syncDocumentLocale,
} from "./config";

initI18n();

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const stored = detectStoredLocale();

    if (stored && stored !== i18n.language) {
      void setLocale(stored);
    } else {
      syncDocumentLocale(i18n.language === "en" ? "en" : "es");
    }

    function onLanguageChanged(lng: string) {
      if (lng === "en" || lng === "es") {
        syncDocumentLocale(lng);
      }
    }

    i18n.on("languageChanged", onLanguageChanged);
    return () => {
      i18n.off("languageChanged", onLanguageChanged);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
