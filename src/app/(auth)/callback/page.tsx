'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AuthShell } from '@/components/auth/AuthShell';
import { api, ApiError } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { OAuthExchangeResponse } from '@/lib/types';

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackHandler />
    </Suspense>
  );
}

function OAuthCallbackHandler() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  // The exchange code is single-use — StrictMode's double-invoke in dev
  // would otherwise burn it on the first render and 400 on the second.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      console.error('[oauth callback] backend redirected with error=', error, searchParams.get('error_description'));
      toast.error(t('auth.callback.error'));
      router.replace('/login');
      return;
    }

    if (!code) {
      router.replace('/login');
      return;
    }

    api
      .post<OAuthExchangeResponse>('auth/oauth/exchange', { code })
      .then(async (data) => {
        setToken(data.accessToken);
        await queryClient.invalidateQueries({ queryKey: ['me'] });
        router.replace(data.needsOnboarding ? '/register?step=basic' : '/dashboard');
      })
      .catch((e) => {
        console.error('[oauth callback] token exchange failed', e);
        toast.error(e instanceof ApiError ? String(e.message) : t('auth.callback.error'));
        router.replace('/login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="h-8 w-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
        <p className="text-sm text-[var(--color-text-muted)]">{t('auth.callback.signingIn')}</p>
      </div>
    </AuthShell>
  );
}
