'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface SearchableSelectProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  error?: string;
}

export function SearchableSelect({
  label,
  required,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  value,
  onChange,
  options,
  disabled,
  error,
}: SearchableSelectProps) {
  const { t } = useLanguage();
  const effectivePlaceholder = placeholder ?? t('common.selectEllipsis');
  const effectiveSearchPlaceholder = searchPlaceholder ?? t('common.searchEllipsis');
  const effectiveEmptyLabel = emptyLabel ?? t('common.noMatches');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  function select(option: string) {
    onChange(option);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-muted)]">
          {label}
          {required && <span className="text-[var(--color-danger)]"> *</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex h-12 items-center justify-between rounded-xl border bg-[var(--color-surface)] px-4 text-left text-[var(--color-text)]',
          'outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
        )}
      >
        <span className={value ? '' : 'text-[var(--color-text-faint)]'}>{value || effectivePlaceholder}</span>
        <ChevronDown size={16} className={clsx('shrink-0 text-[var(--color-text-faint)] transition-transform', open && 'rotate-180')} />
      </button>
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}

      {open && (
        <div className="surface-card absolute top-full z-30 mt-1 w-full overflow-hidden rounded-xl shadow-xl">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3">
            <Search size={15} className="shrink-0 text-[var(--color-text-faint)]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={effectiveSearchPlaceholder}
              className="h-10 w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[var(--color-text-faint)]">{effectiveEmptyLabel}</p>
            ) : (
              filtered.map((option) => {
                const selected = option === value;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => select(option)}
                    className={clsx(
                      'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                      selected
                        ? 'bg-[var(--color-primary-tint)] font-semibold text-[var(--color-primary-accent)]'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]',
                    )}
                  >
                    {option}
                    {selected && <Check size={15} className="shrink-0 text-[var(--color-primary-accent)]" />}
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
