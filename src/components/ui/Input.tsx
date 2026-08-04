'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, required, type, ...props }, ref) => {
    const inputId = id || props.name;
    const isPassword = type === 'password';
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
            {required && <span className="text-[var(--color-danger)]"> *</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            required={required}
            type={isPassword ? (visible ? 'text' : 'password') : type}
            className={clsx(
              'h-12 w-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 text-[var(--color-text)]',
              'placeholder:text-[var(--color-text-faint)] outline-none transition-colors',
              'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
              isPassword && 'pr-11',
              error && 'border-[var(--color-danger)]',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-muted)]"
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
