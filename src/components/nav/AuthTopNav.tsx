'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Wallet } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { AvatarMenu } from './AvatarMenu';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useWallet } from '@/lib/queries';

const navLinks = [
  { href: '/browse', labelKey: 'nav.profiles' },
  { href: '/interests', labelKey: 'nav.interests' },
  { href: '/inbox', labelKey: 'nav.messages' },
  { href: '/dashboard', labelKey: 'nav.dashboard' },
] as const;

export function AuthTopNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: wallet } = useWallet();
  const headerRef = useRef<HTMLElement>(null);

  // Publishes its own rendered height as a CSS var so routes that need to
  // fill exactly "the rest of the viewport" (the inbox) can subtract it
  // without hardcoding a number that'd drift if this nav's height ever does.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => document.documentElement.style.setProperty('--topnav-h', `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="font-display text-xl gradient-text">
          {t('landing.brand')}
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  active ? 'text-[var(--color-primary-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/checkout"
            className="hidden items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] sm:flex"
          >
            <Wallet size={14} className="text-[var(--color-primary-accent)]" />
            {t('common.taka')}
            {wallet?.balance ?? 0}
          </Link>
          <Link
            href="/checkout"
            className="flex items-center gap-1 rounded-full bg-[var(--color-gold-tint)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-gold-accent)] sm:hidden"
          >
            <Wallet size={12} />
            {t('common.taka')}
            {wallet?.balance ?? 0}
          </Link>
          <NotificationBell />
          <AvatarMenu />
        </div>
      </nav>
    </header>
  );
}
