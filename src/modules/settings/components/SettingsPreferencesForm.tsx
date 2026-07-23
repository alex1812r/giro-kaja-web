"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/Button/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/Card/Card";
import { ThemeSwitch } from "@/shared/components/ThemeSwitch/ThemeSwitch";
import {
  detectStoredLocale,
  previewLocale,
  setLocale,
  supportedLocales,
  type Locale,
} from "@/shared/i18n";
import { applyTheme, useTheme } from "@/shared/theme";
import { cn } from "@/shared/utils/cn";

import {
  settingsPreferencesSchema,
  type SettingsPreferencesValues,
} from "../schemas/settingsPreferencesSchema";

function resolveLocale(language: string): Locale {
  return language === "en" ? "en" : "es";
}

export function SettingsPreferencesForm() {
  const { t, i18n } = useTranslation();
  const { persistedTheme, hydrated, setTheme, previewTheme } = useTheme();
  const [savedFlash, setSavedFlash] = useState(false);
  const skipPreviewRef = useRef(true);
  const persistedRef = useRef<SettingsPreferencesValues>({
    theme: persistedTheme,
    locale: resolveLocale(i18n.language),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<SettingsPreferencesValues>({
    resolver: zodResolver(settingsPreferencesSchema),
    defaultValues: {
      theme: persistedTheme,
      locale: resolveLocale(i18n.language),
    },
  });

  persistedRef.current = {
    theme: persistedTheme,
    locale: detectStoredLocale() ?? resolveLocale(i18n.language),
  };

  // Sync form when theme finishes hydrating from localStorage.
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const nextDefaults: SettingsPreferencesValues = {
      theme: persistedTheme,
      locale: detectStoredLocale() ?? "es",
    };

    skipPreviewRef.current = true;
    reset(nextDefaults);
  }, [hydrated, persistedTheme, reset]);

  // Live preview while editing (without persisting until Save).
  useEffect(() => {
    const subscription = watch((values) => {
      if (skipPreviewRef.current) {
        skipPreviewRef.current = false;
        return;
      }

      if (values.theme === "light" || values.theme === "dark") {
        previewTheme(values.theme);
      }

      if (values.locale === "en" || values.locale === "es") {
        void previewLocale(values.locale);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, previewTheme]);

  // Leave page without saving → restore persisted prefs.
  useEffect(() => {
    return () => {
      applyTheme(persistedRef.current.theme);
      void previewLocale(persistedRef.current.locale);
    };
  }, []);

  function handleDiscard() {
    const nextDefaults = persistedRef.current;

    skipPreviewRef.current = true;
    reset(nextDefaults);
    previewTheme(nextDefaults.theme);
    void previewLocale(nextDefaults.locale);
  }

  function onSubmit(values: SettingsPreferencesValues) {
    setTheme(values.theme);
    void setLocale(values.locale).then(() => {
      skipPreviewRef.current = true;
      reset(values);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    });
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.theme")}</CardTitle>
            <CardDescription>{t("settings.themeSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <ThemeSwitch
                  value={field.value}
                  onChange={field.onChange}
                  label={t("themeScreen.darkMode")}
                  description={t("themeScreen.darkModeSubtitle")}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
            <CardDescription>{t("settings.languageSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="locale"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {supportedLocales.map((locale) => {
                    const selected = field.value === locale;
                    const label =
                      locale === "es"
                        ? t("languageSheet.optionEs")
                        : t("languageSheet.optionEn");

                    return (
                      <button
                        key={locale}
                        type="button"
                        onClick={() => field.onChange(locale)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-colors",
                          selected
                            ? "bg-primary-container font-semibold text-on-primary-container"
                            : "bg-surface-muted text-text-main hover:bg-primary-light/60",
                        )}
                      >
                        <span>{label}</span>
                        <span className="text-xs uppercase opacity-70">{locale}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {savedFlash ? (
          <p className="mr-auto text-sm text-success" role="status">
            {t("settings.preferencesSaved")}
          </p>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          disabled={!isDirty}
          onClick={handleDiscard}
        >
          {t("settings.discardChanges")}
        </Button>

        <Button type="submit" disabled={!isDirty}>
          {t("settings.saveChanges")}
        </Button>
      </div>
    </form>
  );
}
