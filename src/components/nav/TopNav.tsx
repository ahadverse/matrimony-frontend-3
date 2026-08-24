'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const navLinks = [
  { href: '/profiles', labelKey: 'nav.profiles' },
  { href: '/success-stories', labelKey: 'landing.navStories' },
  { href: '/how-it-works', labelKey: 'landing.navHowItWorks' },
  { href: '/assistance-service', labelKey: 'assistantService.navLabel' },
  { href: '/faq', labelKey: 'landing.navFaq' },
  { href: '/contact-us', labelKey: 'contactPage.navLabel' },
] as const;

export function TopNav() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={t('landing.brand')} className="h-16 w-16" />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block">
            <Button variant="secondary" size="md">
              {t('landing.ctaSecondary')}
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t('common.close') : t('common.menu')}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <Link href="/login" className="mt-1 sm:hidden" onClick={() => setMobileOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                {t('landing.ctaSecondary')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
