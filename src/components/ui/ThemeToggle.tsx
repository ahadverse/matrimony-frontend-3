'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeProvider';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 ${className ?? ''}`}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          onClick={() => setTheme(value)}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            resolvedTheme === value
              ? 'gradient-primary text-[var(--color-on-primary)]'
              : 'text-[var(--color-text-faint)] hover:text-[var(--color-text)]'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
