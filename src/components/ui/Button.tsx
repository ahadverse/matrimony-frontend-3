'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'md' | 'lg' | 'icon';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'gradient-primary text-[var(--color-on-primary)] glow-primary hover:brightness-110',
  secondary: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-accent)]',
  ghost: 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
  danger: 'bg-[var(--color-danger-tint)] text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:brightness-95',
  // Premium / monetization CTAs: spotlight, wallet top-up, unlock.
  gold: 'gradient-gold text-[var(--color-on-gold)] glow-gold hover:brightness-105',
};

const sizeClasses: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
  icon: 'h-12 w-12',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current/40 border-t-current animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';
