import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * The loading shape of `PublicProfileRow`.
 *
 * Every box here mirrors a real element's size and position in that component —
 * the 4:5 photo that becomes `sm:h-44 sm:w-36`, the heading, the two-column
 * stats grid, the location line and the button row. That is the whole point:
 * when the data lands nothing moves, so the list settles instead of jumping.
 *
 * If `PublicProfileRow`'s layout changes, this has to change with it.
 */
export function PublicProfileRowSkeleton() {
  return (
    <Card className="flex flex-col gap-4 overflow-hidden p-4 sm:flex-row">
      <Skeleton className="aspect-[4/5] w-full shrink-0 rounded-xl sm:h-44 sm:w-36" />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Heading — matches the display-size name link. */}
        <Skeleton className="h-6 w-40 max-w-[70%]" />

        {/* Six stat rows in the same 1-then-2 column grid as the real card. */}
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </dl>

        <Skeleton className="mt-3 h-3 w-48 max-w-[80%]" />
        <Skeleton className="mt-2.5 h-3.5 w-full" />

        {/* Button row: unlock, view profile, interest, message. */}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}
