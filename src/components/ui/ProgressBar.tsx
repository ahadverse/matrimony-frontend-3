import clsx from 'clsx';

interface ProgressBarProps {
  percent: number;
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({ percent, className, trackClassName }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={clsx('h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]', trackClassName)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={clsx(
          'h-full rounded-full transition-all duration-500',
          // A completed profile earns the gold treatment.
          clamped >= 100 ? 'gradient-gold' : 'gradient-primary',
          className,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
