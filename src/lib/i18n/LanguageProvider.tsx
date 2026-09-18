'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
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

/* The saved locale is a browser value, not React state, so it is read through
   useSyncExternalStore rather than restored in an effect: the server snapshot is
   always 'en' — matching the `lang` in the root layout — while the client
   snapshot is whatever was saved, so hydration never disagrees and there is no
   second render pass to schedule. */

let listeners: Array<() => void> = [];
let snapshot: Locale | null = null;

function subscribe(onChange: () => void): () => void {
  listeners = [...listeners, onChange];
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

function getSnapshot(): Locale {
  // Cached because useSyncExternalStore requires a stable value between
  // changes — reading localStorage on every call is also needless work.
  if (snapshot === null) {
    let saved: string | null = null;
    // Throws in a private window or with site data blocked; English is fine.
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    snapshot = saved === 'bn' || saved === 'en' ? saved : 'en';
  }
  return snapshot;
}

function getServerSnapshot(): Locale {
  return 'en';
}

function storeLocale(next: Locale): void {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // A locale that cannot be persisted still applies for this session.
  }
  listeners.forEach((l) => l());
}

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
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html lang> honest for screen readers and translation tooling; the
  // server rendered 'en' and only this switch can change it.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => storeLocale(next), []);

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
