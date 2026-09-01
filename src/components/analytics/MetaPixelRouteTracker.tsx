'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/* The last path a PageView was counted for. Module scope, not a ref, so that
   two mounted copies of <MetaPixel /> (the layout renders it in both <head>
   and <body>) still report one PageView per navigation rather than two. */
let lastTrackedPath: string | null = null;

/**
 * Fires a PageView on every client-side navigation.
 *
 * The base pixel snippet already fired one for the initial document, so the
 * first path this sees is recorded without being counted — otherwise every
 * hard load would report two PageViews and inflate Events Manager.
 *
 * Keyed on pathname only. Query-string changes (pagination, filters on the
 * search page) are the same page as far as the funnel is concerned, and
 * useSearchParams would force every route under this layout out of static
 * rendering.
 */
export function MetaPixelRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (lastTrackedPath === pathname) return;
    const isInitialLoad = lastTrackedPath === null;
    lastTrackedPath = pathname;
    if (isInitialLoad) return;
    window.fbq?.('track', 'PageView');
  }, [pathname]);

  return null;
}
