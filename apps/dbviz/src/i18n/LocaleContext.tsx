import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Locale, LOCALE_STORAGE_KEY, useTranslations } from "./index";

type LocaleCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: ReturnType<typeof useTranslations>;
};

const LocaleContext = createContext<LocaleCtx | null>(null);

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useTranslations(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
