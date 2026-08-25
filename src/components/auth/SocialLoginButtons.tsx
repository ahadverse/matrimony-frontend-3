'use client';

import { BACKEND_URL } from '@/lib/api-client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        fill="#1877F2"
        d="M36 18c0-9.94-8.06-18-18-18S0 8.06 0 18c0 8.98 6.58 16.41 15.19 17.77V23.2h-4.57V18h4.57v-3.97c0-4.51 2.69-7.01 6.8-7.01 1.97 0 4.03.35 4.03.35v4.43h-2.27c-2.24 0-2.94 1.39-2.94 2.81V18h5l-.8 5.2h-4.2v12.57C29.42 34.41 36 26.98 36 18z"
      />
    </svg>
  );
}

function goTo(path: string) {
  window.location.href = `${BACKEND_URL}${path}`;
}

/**
 * Reused by both the register wizard's first screen and the login page —
 * full navigations (not fetches), since Google/Facebook's consent screen
 * needs a real browser redirect.
 */
export function SocialLoginButtons() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => goTo('/auth/google')}
        className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
      >
        <GoogleIcon />
        {t('auth.socialLogin.google')}
      </button>
      <button
        type="button"
        onClick={() => goTo('/auth/facebook')}
        className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
      >
        <FacebookIcon />
        {t('auth.socialLogin.facebook')}
      </button>
    </div>
  );
}
