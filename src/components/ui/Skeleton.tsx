import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

/**
 * A placeholder block shaped like the content that is about to replace it.
 *
 * Kept deliberately plain: the point of a skeleton is that the real layout
 * lands in exactly the same place, so these are only ever sized by the caller
 * to match a specific element rather than being generic grey boxes.
 *
 * `motion-reduce:animate-none` because a page full of pulsing blocks is exactly
 * the kind of thing a reduced-motion preference is asking us not to do.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={clsx(
        'animate-pulse rounded-md bg-[var(--color-surface-raised)] motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Wraps a group of skeletons so assistive tech announces "loading" once,
 * instead of reading out nothing at all (every Skeleton is aria-hidden).
 */
export function SkeletonGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  );
}
