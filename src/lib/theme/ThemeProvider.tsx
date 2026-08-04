'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'biyekori_theme';

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/* Always writes a RESOLVED theme. globals.css has a single dark block keyed off
   this attribute and no prefers-color-scheme query, so leaving the attribute
   off for 'system' would strand the page in light mode. */
function applyTheme(theme: ThemePreference) {
  const resolved = theme === 'system' ? systemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    const initial = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    setThemeState(initial);
    setResolvedTheme(initial === 'system' ? systemTheme() : initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    // Repaint on a live OS theme change — the attribute is authoritative now,
    // so updating React state alone would leave the page on the old palette.
    const handler = () => {
      setResolvedTheme(mq.matches ? 'dark' : 'light');
      applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    setResolvedTheme(next === 'system' ? systemTheme() : next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
