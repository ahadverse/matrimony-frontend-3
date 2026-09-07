'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import clsx from 'clsx';
import { useCountries } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { exampleNumberFor } from '@/lib/phoneExamples';
import type { GeoCountry } from '@/lib/geo';

/** Shown before the country list has loaded, so the field is never unusable on a slow connection. */
const FALLBACK = { iso2: 'BD', dialCode: '880', flag: '🇧🇩' };

export interface PhoneValue {
  /** Dial code without the leading `+` — "880", "44", "1". */
  dialCode: string;
  /** ISO-2 of the chosen country. Needed because several countries share a dial code. */
  iso2: string;
  /** Whatever the member typed after the dial code, digits only. */
  number: string;
}

export const EMPTY_PHONE: PhoneValue = {
  dialCode: FALLBACK.dialCode,
  iso2: FALLBACK.iso2,
  number: '',
};

/**
 * Joins the two halves into the E.164 string the API stores. Returns `''` while
 * the national part is empty, so callers can treat "no phone yet" as falsy
 * rather than having to recognise a bare "+880".
 */
export function formatPhone(value: PhoneValue): string {
  const digits = value.number.replace(/\D/g, '');
  return digits ? `+${value.dialCode}${digits}` : '';
}

/**
 * A country dial-code picker fused to a national number field.
 *
 * The two controls share a single border and focus ring so they read as one
 * input — the pattern every payment and telecom form uses — rather than as a
 * dropdown that happens to sit beside a text box. The trigger is deliberately
 * terse (flag + `+880`); the country's full name belongs in the list, not in a
 * button narrow enough to wrap it onto two lines.
 *
 * Split into two controls at all because the API validates with
 * `@IsPhoneNumber()`, which only accepts full E.164 — leaving people to type
 * the `+` and country code by hand was the most common way to fail that check.
 *
 * Flag emoji fall back to the two regional-indicator letters on Windows, which
 * still reads correctly ("BD +880"), so no image sprite is pulled in for them.
 */
export function PhoneInput({
  value,
  onChange,
  label,
  required,
  error,
  hint,
}: {
  value: PhoneValue;
  onChange: (next: PhoneValue) => void;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  const { t } = useLanguage();
  const { data: countries } = useCountries();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => buildOptions(countries), [countries]);
  const selected = useMemo(
    () => options.find((o) => o.iso2 === value.iso2) ?? null,
    [options, value.iso2],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || o.dialCode.startsWith(q.replace(/^\+/, '')),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label htmlFor="phone-national" className="text-sm font-medium text-[var(--color-text-muted)]">
        {label}
        {required && <span className="text-[var(--color-danger)]"> *</span>}
      </label>

      {/* One box, two controls: the ring lives on the wrapper so tabbing
          between the country button and the number never splits the field. */}
      <div
        className={clsx(
          'flex h-12 items-stretch overflow-hidden rounded-xl border bg-[var(--color-surface)] transition-colors',
          error
            ? 'border-[var(--color-danger)]'
            : focused || open
              ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
              : 'border-[var(--color-border)]',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t('auth.register.phoneCountry')}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap pl-3.5 pr-2.5 text-[var(--color-text)] outline-none transition-colors hover:bg-[var(--color-surface-raised)]"
        >
          <span className="text-base leading-none">{selected?.flag ?? FALLBACK.flag}</span>
          <span className="text-sm font-medium tabular-nums">+{value.dialCode}</span>
          <ChevronDown
            size={15}
            className={clsx(
              'text-[var(--color-text-faint)] transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>

        <span aria-hidden className="my-2 w-px shrink-0 bg-[var(--color-border)]" />

        <input
          id="phone-national"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          // Left blank for a country with no example on file, rather than
          // showing Bangladesh's shape to someone in Portugal — people type to
          // match the placeholder, so a wrong one is worse than none.
          placeholder={exampleNumberFor(value.iso2) ?? ''}
          value={value.number}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange({ ...value, number: e.target.value.replace(/\D/g, '') })}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      {hint && !error && <span className="text-xs text-[var(--color-text-faint)]">{hint}</span>}

      {open && (
        <div className="surface-card absolute top-full z-30 mt-1 w-[min(24rem,100%)] overflow-hidden rounded-xl shadow-xl">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3">
            <Search size={15} className="shrink-0 text-[var(--color-text-faint)]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('auth.register.phoneCountrySearch')}
              className="h-10 w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
            />
          </div>

          <div role="listbox" className="max-h-60 overflow-y-auto py-1">
            {visible.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[var(--color-text-faint)]">
                {t('common.noMatches')}
              </p>
            ) : (
              visible.map((option) => {
                const isSelected = option.iso2 === value.iso2;
                return (
                  <button
                    key={option.iso2}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange({ ...value, iso2: option.iso2, dialCode: option.dialCode });
                      close();
                    }}
                    className={clsx(
                      'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-[var(--color-primary-tint)] font-semibold text-[var(--color-primary-accent)]'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]',
                    )}
                  >
                    <span className="text-base leading-none">{option.flag}</span>
                    <span className="min-w-0 flex-1 truncate">{option.name}</span>
                    <span className="shrink-0 tabular-nums text-[var(--color-text-muted)]">
                      +{option.dialCode}
                    </span>
                    {isSelected && (
                      <Check size={15} className="shrink-0 text-[var(--color-primary-accent)]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CountryOption {
  iso2: string;
  name: string;
  flag: string;
  dialCode: string;
}

function buildOptions(countries: GeoCountry[] | undefined): CountryOption[] {
  if (!countries) return [];
  return countries
    .filter((c) => c.phonecode)
    .map((c) => ({
      iso2: c.iso2,
      name: c.name,
      flag: c.emoji,
      dialCode: c.phonecode.replace(/\D/g, ''),
    }))
    .filter((o) => o.dialCode)
    .sort((a, b) => a.name.localeCompare(b.name));
}
