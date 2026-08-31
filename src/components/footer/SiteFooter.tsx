'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ACTIVE_SOCIAL_LINKS } from '@/lib/seo/site';

/**
 * "Plans" used to point at /checkout — the wallet top-up screen, which is
 * behind auth (see proxy.ts) and disallowed in robots.txt. Every marketing page
 * carries this footer, so that was a site-wide link bouncing visitors to login
 * and pointing crawlers into a blocked path. The paid offering a public visitor
 * can actually read about is the assisted service.
 */
const platformLinks = [
  { href: '/', labelKey: 'footer.home' },
  { href: '/profiles', labelKey: 'nav.profiles' },
  { href: '/how-it-works', labelKey: 'footer.guide' },
  { href: '/features', labelKey: 'landing.navFeatures' },
  { href: '/success-stories', labelKey: 'landing.navStories' },
  { href: '/assistance-service', labelKey: 'assistantService.navLabel' },
  { href: '/faq', labelKey: 'footer.faq' },
  { href: '/contact-us', labelKey: 'footer.contact' },
  { href: '/register', labelKey: 'footer.joinFree' },
] as const;

const legalLinks = [
  { href: '/terms', labelKey: 'footer.terms' },
  { href: '/privacy', labelKey: 'footer.privacy' },
] as const;

// lucide ships no post-rebrand X glyph; `Twitter` is the icon for that account.
const SOCIAL_ICONS: Record<string, typeof Facebook> = {
  Facebook,
  X: Twitter,
  Instagram,
  YouTube: Youtube,
};

// Same list that feeds /contact-us and the Organization schema's `sameAs`, so a
// profile added or retired in site.ts moves all three together. Platform names
// are proper nouns and stay untranslated in the aria-label — an icon on its own
// has no accessible name at all.
const socials = ACTIVE_SOCIAL_LINKS.filter((link) => link.label in SOCIAL_ICONS).map((link) => ({
  icon: SOCIAL_ICONS[link.label],
  href: link.url,
  label: link.label,
}));

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
            <Link href="/" className="inline-flex items-center" aria-label={t('landing.brand')}>
              <Image src="/logo.webp" alt={t('landing.brand')} width={64} height={64} className="h-16 w-16" />
            </Link>
            <p className="inverse-muted mt-3 max-w-xs text-sm">{t('landing.footerBrandBody')}</p>

            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    // Only the border is set on hover: `.inverse-band a:hover` already
                    // takes the glyph to gold, and it outspecifies a `hover:text-*`
                    // utility, so declaring one here would be dead weight.
                    className="inverse-muted flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-inverse-border)] transition-colors hover:border-[var(--color-inverse-accent)]"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
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
