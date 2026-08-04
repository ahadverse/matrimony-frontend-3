'use client';

import clsx from 'clsx';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={clsx(
        'flex flex-wrap gap-1 rounded-2xl bg-[var(--color-surface)] p-1.5',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={clsx(
              'relative flex-1 min-w-fit rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap',
              active
                ? 'bg-[var(--color-surface-raised)] text-[var(--color-primary-accent)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={clsx(
                  'ml-1.5',
                  active ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-faint)]',
                )}
              >
                ({item.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
