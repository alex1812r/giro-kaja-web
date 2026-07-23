import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/shared/locales/en.json";
import es from "@/shared/locales/es.json";

export type Locale = "en" | "es";

export const supportedLocales: Locale[] = ["en", "es"];
export const defaultLocale: Locale = "es";
export const localeStorageKey = "giro-kaja:locale";

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

/** Solo cliente: lee preferencia guardada. No usar en el primer render (SSR). */
export function detectStoredLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(localeStorageKey);
    if (stored && isLocale(stored)) {
      return stored;
    }
  } catch {
    // ignore
  }

  return null;
}

export function syncDocumentLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

let initialized = false;

/**
 * Siempre inicia en `defaultLocale` (es) para que SSR y el primer
 * render del cliente coincidan. La preferencia de localStorage se aplica
 * después del mount en I18nProvider.
 */
export function initI18n() {
  if (initialized) {
    return i18n;
  }

  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    interpolation: {
      escapeValue: false,
    },
  });

  initialized = true;

  return i18n;
}

/** Cambia idioma en UI sin persistir (preview de ajustes). */
export async function previewLocale(locale: Locale) {
  await i18n.changeLanguage(locale);
  syncDocumentLocale(locale);
}

export async function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {
      // ignore
    }
  }

  await i18n.changeLanguage(locale);
  syncDocumentLocale(locale);
}

export { i18n };
