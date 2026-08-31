'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * Every indexable marketing route is reachable from here. /features,
 * /how-it-works and /faq were previously linked only from inside the home
 * page's own sections and from the footer, which left them several clicks deep
 * from anywhere else on the site.
 */
const navLinks = [
  { href: '/profiles', labelKey: 'nav.profiles' },
  { href: '/how-it-works', labelKey: 'landing.navHowItWorks' },
  { href: '/features', labelKey: 'landing.navFeatures' },
  { href: '/success-stories', labelKey: 'landing.navStories' },
  { href: '/assistance-service', labelKey: 'assistantService.navLabel' },
  { href: '/faq', labelKey: 'landing.navFaq' },
  { href: '/contact-us', labelKey: 'contactPage.navLabel' },
] as const;

export function TopNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Same rule the signed-in nav (AuthTopNav) uses, so both navs agree on what
  // "current page" means: exact match, or a nested route under the link.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="relative sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label={t('landing.brand')}>
          <Image
            src="/logo.webp"
            alt={t('landing.brand')}
            width={64}
            height={64}
            priority
            className="h-16 w-16"
          />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'relative py-1 text-sm transition-colors',
                  active
                    ? 'font-semibold text-[var(--color-primary-accent)]'
                    : 'font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                )}
              >
                {t(link.labelKey)}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[var(--color-primary-accent)]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Two separate actions. There was one button labelled
              "Sign/Register" that went only to /login, so the primary
              conversion path — registering — had no header entry at all. */}
          <Link href="/login" className="hidden sm:block">
            <Button variant="secondary" size="md">
              {t('landing.ctaSecondary')}
            </Button>
          </Link>
          <Link href="/register" className="hidden sm:block">
            <Button size="md">{t('landing.ctaJoin')}</Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t('common.close') : t('common.menu')}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 shadow-lg lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'border-[var(--color-primary-accent)] bg-[var(--color-primary-tint)] font-semibold text-[var(--color-primary-accent)]'
                      : 'border-transparent font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            <div className="mt-2 flex flex-col gap-2 sm:hidden">
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button size="md" className="w-full">
                  {t('landing.ctaJoin')}
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="md" className="w-full">
                  {t('landing.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
