'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const platformLinks = [
  { href: '/', labelKey: 'footer.home' },
  { href: '/profiles', labelKey: 'nav.profiles' },
  { href: '/checkout', labelKey: 'footer.plans' },
  { href: '/how-it-works', labelKey: 'footer.guide' },
  { href: '/contact-us', labelKey: 'footer.contact' },
  { href: '/register', labelKey: 'footer.joinFree' },
] as const;

const legalLinks = [
  { href: '/terms', labelKey: 'footer.terms' },
  { href: '/privacy', labelKey: 'footer.privacy' },
] as const;

export function SiteFooter({ className }: { className?: string } = {}) {
  const { t } = useLanguage();
  const pathname = usePathname();

  // The inbox is a fixed-height, self-scrolling screen — a footer stacked
  // underneath it would reintroduce page scroll and undo that.
  if (pathname === '/inbox' || pathname.startsWith('/inbox/')) return null;

  return (
    <footer className={`inverse-band border-t px-6 py-14 ${className ?? ''}`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt={t('landing.brand')} className="h-16 w-16" />
            </Link>
            <p className="inverse-muted mt-3 max-w-xs text-sm">{t('landing.footerBrandBody')}</p>
          </div>

          <div>
            <div className="inverse-muted text-xs font-semibold uppercase tracking-wider">
              {t('footer.platform')}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {platformLinks.map((link) => (
                <Link key={link.labelKey} href={link.href} className="inverse-muted text-sm">
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="inverse-muted text-xs font-semibold uppercase tracking-wider">{t('footer.legal')}</div>
            <div className="mt-4 flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link key={link.labelKey} href={link.href} className="inverse-muted text-sm">
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-[var(--color-inverse-border)] pt-6 text-center text-xs">
          <span className="inverse-muted">{t('footer.registeredOffice')}</span>
          <span className="inverse-muted">{t('landing.footerCopyright', { year: new Date().getFullYear() })}</span>
        </div>
      </div>
    </footer>
  );
}
