import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Card } from './Card';

interface StatTileProps {
  icon?: ReactNode;
  value: ReactNode;
  label: string;
  className?: string;
}

export function StatTile({ icon, value, label, className }: StatTileProps) {
  return (
    <Card className={clsx('flex flex-col gap-1 p-4', className)}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold-tint)] text-[var(--color-gold-accent)]">
            {icon}
          </span>
        )}
        <span className="font-display text-2xl text-[var(--color-text)]">{value}</span>
      </div>
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
    </Card>
  );
}
