'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AuthShell } from '@/components/auth/AuthShell';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { AuthResponse } from '@/lib/types';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => api.post<AuthResponse>('auth/login', { identifier, password }),
    onSuccess: async (data) => {
      setToken(data.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push(searchParams.get('redirect') || '/dashboard');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? String(error.message) : t('auth.login.error'));
    },
  });

  return (
    <AuthShell>
      <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.login.title')}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('auth.login.subtitle')}</p>

      <div className="mt-6">
        <SocialLoginButtons />
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-faint)]">{t('auth.socialLogin.or')}</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          loginMutation.mutate();
        }}
      >
        <Input
          label={t('auth.login.identifier')}
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t('auth.login.identifierPlaceholder')}
          required
        />
        <Input
          label={t('auth.login.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" className="mt-2 w-full" loading={loginMutation.isPending}>
          {t('auth.login.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        {t('auth.login.noAccount')}{' '}
        <Link href="/register" className="text-[var(--color-primary-light)] font-medium">
          {t('auth.login.registerLink')}
        </Link>
      </p>
    </AuthShell>
  );
}
