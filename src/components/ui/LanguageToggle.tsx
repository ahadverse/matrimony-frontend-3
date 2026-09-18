'use client';

import { useLanguage, type Locale } from '@/lib/i18n/LanguageProvider';

// Each language is labelled in its own script rather than with a flag: Bangla
// is spoken either side of a border, so a flag would name a country instead of
// the language.
const OPTIONS: { value: Locale; label: string; aria: string }[] = [
  { value: 'en', label: 'EN', aria: 'English' },
  { value: 'bn', label: 'বাং', aria: 'বাংলা' },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 ${className ?? ''}`}
    >
      {OPTIONS.map(({ value, label, aria }) => (
        <button
          key={value}
          type="button"
          lang={value}
          aria-label={aria}
          aria-pressed={locale === value}
          onClick={() => setLocale(value)}
          className={`flex h-7 min-w-9 items-center justify-center rounded-full px-2 text-xs font-medium transition-colors ${
            locale === value
              ? 'gradient-primary text-[var(--color-on-primary)]'
              : 'text-[var(--color-text-faint)] hover:text-[var(--color-text)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
