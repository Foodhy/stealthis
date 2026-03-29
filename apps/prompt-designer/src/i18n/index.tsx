import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Locale, messages } from "@/i18n/messages";

const LOCALE_STORAGE_KEY = "pd_locale";

type TranslationParams = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const resolveInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "en";

  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved === "en" || saved === "es") return saved;

  return "en";
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams, fallback?: string) => {
      const template = messages[locale][key] ?? messages.en[key] ?? fallback ?? key;
      if (!params) return template;

      return Object.entries(params).reduce((acc, [paramKey, value]) => {
        return acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
      }, template);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
