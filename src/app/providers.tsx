'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 15_000,
            // Navigating away and back within five minutes now paints from
            // cache immediately and revalidates behind the scenes, instead of
            // re-fetching from empty. The default gcTime is 5 minutes, which
            // meant a cached page was often already evicted by the time a
            // reader returned to it.
            gcTime: 30 * 60_000,
            // A `staleTime` hit still repaints instantly from cache; without
            // this, a reader who briefly loses signal keeps stale data with no
            // attempt to catch up once they are back.
            refetchOnReconnect: true,
            // Re-running a request that failed because the tab was offline is
            // pointless — react-query retries it on reconnect instead.
            networkMode: 'offlineFirst',
          },
          mutations: { networkMode: 'offlineFirst' },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          {children}
          <Toaster
            position="top-center"
            containerStyle={{ top: 76 }}
            toastOptions={{
              style: {
                background: 'var(--color-surface-raised)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
