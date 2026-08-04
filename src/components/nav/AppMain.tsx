'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';

/**
 * Every other route lets the document scroll — the page grows past the
 * viewport and that's intentional. The inbox is the exception: its layout
 * already builds a `min-h-0 flex-1 overflow-y-auto` chain meant to cap height
 * and scroll internally, but that chain needs a definite ancestor height,
 * which nothing above it provided.
 *
 * `flex-none` matters here: the shared `flex-1` sets `flex-basis: 0%`, which
 * takes precedence over `height` for a column flex item, so the explicit
 * height below would be ignored and the thread would grow per message.
 */
export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInbox = pathname === '/inbox' || pathname.startsWith('/inbox/');
  // BottomTabBar hides itself inside a thread, so reserving room for it there
  // would just be dead space under the composer.
  const isThread = pathname.startsWith('/inbox/');

  return (
    <main
      className={clsx(
        'mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:pb-6',
        isThread ? 'pb-[calc(1.5rem+env(safe-area-inset-bottom))]' : 'pb-[calc(5rem+env(safe-area-inset-bottom))]',
        isInbox
          ? 'h-[calc(100dvh-var(--topnav-h,4.5rem))] min-h-0 flex-none overflow-hidden'
          : 'flex-1',
      )}
    >
      {children}
    </main>
  );
}
