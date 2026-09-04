'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import en from '@/messages/en.json';
import bn from '@/messages/bn.json';

export type Locale = 'en' | 'bn';

// English is the reference dictionary; `t` falls back to it key by key, so bn
// is allowed to be a subset. Typing this as `typeof en` instead would force
// every new English string to be translated before it could even compile.
const dictionaries: Record<Locale, unknown> = { en, bn };
const STORAGE_KEY = 'biyekoralagbe_locale';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolve(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (vars[key] !== undefined ? String(vars[key]) : match));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // The language switchers are gone, so the locale is pinned to Bangla. `t`
  // still falls back to the English dictionary key by key, so any string bn.json
  // has not translated yet renders in English rather than as a raw key.
  const [locale, setLocaleState] = useState<Locale>('bn');

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = resolve(dictionaries[locale], key) ?? resolve(dictionaries.en, key) ?? key;
      return interpolate(String(value), vars);
    },
    [locale],
  );

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
