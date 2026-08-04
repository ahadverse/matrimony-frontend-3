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
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
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
