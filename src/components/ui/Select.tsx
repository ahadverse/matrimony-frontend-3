import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, placeholder, children, required, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
            {required && <span className="text-[var(--color-danger)]"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={clsx(
            'h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 text-[var(--color-text)]',
            'outline-none transition-colors',
            'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--color-danger)]',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      </div>
    );
  },
);
Select.displayName = 'Select';
