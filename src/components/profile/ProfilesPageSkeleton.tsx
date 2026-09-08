import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PublicProfileRowSkeleton } from './PublicProfileRowSkeleton';

/**
 * The whole directory in its loading state — filters column and all.
 *
 * Shared by the route's `loading.tsx` (shown while Next streams the page in)
 * and by the `useSearchParams` Suspense boundary inside the page itself. Both
 * used to render something different from the list's own skeletons, so arriving
 * at /profiles flashed through two or three distinct layouts before settling.
 * One shape for every stage means the page fades in rather than reassembling.
 *
 * Deliberately free of `useLanguage`: `loading.tsx` renders before the client
 * providers are mounted, and a skeleton has no copy to translate anyway.
 */
export function ProfilesPageSkeleton({
  rows = 6,
  label = 'Loading profiles',
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6"
    >
      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="hidden lg:block">
          <Card className="flex flex-col gap-5 p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
            <div className="flex gap-2">
              <Skeleton className="h-9 w-11 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </Card>
        </aside>

        <div>
          {/* Mirrors the "N profiles found" line and the mobile filter button. */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-24 rounded-full lg:hidden" />
          </div>

          <div className="flex flex-col gap-4">
            {Array.from({ length: rows }).map((_, i) => (
              <PublicProfileRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
