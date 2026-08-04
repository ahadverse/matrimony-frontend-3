import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('surface-card rounded-2xl shadow-sm', className)} {...props} />;
}
