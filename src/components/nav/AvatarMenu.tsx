'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, KeyRound, LogOut, ShieldCheck, User, Wallet } from 'lucide-react';
import { useMyProfile } from '@/lib/queries';
import { useLanguage, type Locale } from '@/lib/i18n/LanguageProvider';
import { api, resolveUploadUrl } from '@/lib/api-client';
import { clearToken } from '@/lib/auth-token';
import { resetChatSocket } from '@/lib/socket';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AvatarMenu() {
  const { t, locale, setLocale } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useMyProfile();

  function logout() {
    clearToken();
    resetChatSocket();
    queryClient.clear();
    router.push('/login');
  }

  function changeLocale(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    api.patch('users/me/language', { languagePref: next }).catch(() => {});
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const primaryPhoto = profile?.photos.find((p) => p.isPrimary) ?? profile?.photos[0] ?? null;
  const photoUrl = resolveUploadUrl(primaryPhoto?.url);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-[var(--color-surface)]"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]">
            <User size={14} />
          </span>
        )}
        <span className="hidden text-sm font-medium text-[var(--color-text)] sm:inline">
          {profile?.name?.split(' ')[0] ?? t('nav.account')}
        </span>
        <ChevronDown size={14} className="text-[var(--color-text-faint)]" />
      </button>

      {open && (
        <div className="surface-card absolute right-0 z-30 mt-2 w-56 rounded-xl py-2 shadow-xl">
          <Link
            href="/edit-profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            <User size={15} /> {t('nav.editProfile')}
          </Link>
          <Link
            href="/verify-selfie"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            <ShieldCheck size={15} /> {t('nav.verify')}
          </Link>
          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            <Wallet size={15} /> {t('nav.wallet')}
          </Link>
          <Link
            href="/edit-profile?tab=privacy"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            <KeyRound size={15} /> {t('nav.password')}
          </Link>

          <div className="my-1 border-t border-[var(--color-border)]" />

          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-[var(--color-text)]">{t('nav.theme')}</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-[var(--color-text)]">{t('nav.language')}</span>
            <div className="flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
              {(['en', 'bn'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changeLocale(value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    locale === value
                      ? 'gradient-primary text-[var(--color-on-primary)]'
                      : 'text-[var(--color-text-faint)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {value === 'en' ? 'EN' : 'বাং'}
                </button>
              ))}
            </div>
          </div>

          <div className="my-1 border-t border-[var(--color-border)]" />

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-tint)]"
          >
            <LogOut size={15} /> {t('common.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
