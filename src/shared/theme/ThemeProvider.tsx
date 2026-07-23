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
  applyTheme,
  getStoredTheme,
  type Theme,
  themeStorageKey,
} from "./theme";

type ThemeContextValue = {
  /** Tema aplicado en UI (puede ser preview). */
  theme: Theme;
  /** Tema persistido en localStorage. */
  persistedTheme: Theme;
  hydrated: boolean;
  /** Aplica y persiste. */
  setTheme: (theme: Theme) => void;
  /** Solo aplica en UI (sin guardar). */
  previewTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [persistedTheme, setPersistedTheme] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    setPersistedTheme(stored);
    applyTheme(stored);
    setHydrated(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setPersistedTheme(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(themeStorageKey, next);
    } catch {
      // ignore
    }
  }, []);

  const previewTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      persistedTheme,
      hydrated,
      setTheme,
      previewTheme,
      toggleTheme: () => {
        setTheme(theme === "dark" ? "light" : "dark");
      },
    }),
    [theme, persistedTheme, hydrated, setTheme, previewTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }
  return context;
}
