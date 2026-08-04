import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'inverse' | 'gold';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  primary: 'bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]',
  success: 'bg-[var(--color-success-tint)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-tint)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-tint)] text-[var(--color-danger)]',
  neutral: 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
  // Only ever used inside .inverse-band, which stays dark in both themes.
  inverse: 'bg-[var(--color-inverse-surface)] text-[var(--color-inverse-text)]',
  // Spotlight, premium tiers, verified-plus.
  gold: 'bg-[var(--color-gold-tint)] text-[var(--color-gold-accent)]',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
