'use client';

import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { Crown, Heart, Phone, UserCheck, Users } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * Drop the relationship-manager cut-out in `public/` and put its path here to
 * turn the portrait column on — a transparent PNG/WebP of roughly 3:4 works
 * best, since the image is anchored to the banner's bottom edge and bleeds off
 * it. While this is null the copy simply takes the full width and the gold
 * watermark fills the right-hand side, so the banner is never half-empty.
 */
// Served from the `public/` folder, which Next.js maps to the site root — the
// path here is therefore '/assistant.png', with no '/public' segment.
const MANAGER_PHOTO: string | null = '/assistant.png';

const points = [
  { icon: Users, key: 'assistantService.bannerPoint1' },
  { icon: UserCheck, key: 'assistantService.bannerPoint2' },
  { icon: Phone, key: 'assistantService.bannerPoint3' },
] as const;

interface AssistedServiceBannerProps {
  /**
   * Makes the whole banner one link. Omitted — on the assistance page itself,
   * where there is nowhere to navigate to — the CTA scrolls down to the enquiry
   * form instead.
   */
  href?: string;
  className?: string;
}

export function AssistedServiceBanner({ href, className }: AssistedServiceBannerProps) {
  const { t } = useLanguage();

  // `t` returns a plain string, so the highlighted fragment is carried as a
  // literal {highlight} placeholder left un-substituted and split out here.
  // Keeping it a placeholder rather than three separate keys lets Bangla put
  // the emphasis wherever its word order needs it.
  const [subtitleBefore, subtitleAfter] = t('assistantService.bannerSubtitle').split('{highlight}');

  const cta = t('assistantService.bannerCta');

  // The copy is held to a readable measure beside the portrait, but without one
  // it has the whole banner to fill — at the width this sits at on the profile
  // page, max-w-md would leave half the card empty next to the watermark.
  const copyWidth = MANAGER_PHOTO ? 'max-w-md' : 'max-w-2xl';

  const ctaClasses =
    'gradient-gold glow-gold inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-[var(--color-on-gold)] transition-[filter] group-hover:brightness-105';

  const body = (
    <>
      {/* Decorative only — the portrait, when set, is the banner's art. */}
      <Heart
        strokeWidth={1}
        className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 -rotate-12 text-[var(--color-gold)]/10"
        aria-hidden
      />

      <div className="relative z-10 flex-1 p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <span className="gradient-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-on-gold)]">
            <Crown size={16} />
          </span>
          <h3 className="font-display text-xl text-[var(--color-gold-light)] sm:text-2xl">
            {t('assistantService.bannerTitle')}
          </h3>
        </div>

        <p className={clsx('mt-3 text-sm leading-relaxed text-white/85 sm:text-base', copyWidth)}>
          {subtitleBefore}
          <strong className="font-semibold text-[var(--color-gold-light)]">
            {t('assistantService.bannerHighlight')}
          </strong>
          {subtitleAfter}
        </p>

        <ul
          className={clsx(
            'mt-5 space-y-3 rounded-xl border border-white/10 bg-black/20 p-4',
            copyWidth,
            !MANAGER_PHOTO && 'sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0',
          )}
        >
          {points.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-start gap-3 text-sm text-white/90">
              <Icon size={17} className="mt-0.5 shrink-0 text-[var(--color-gold-light)]" aria-hidden />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>

        {/* Below sm the portrait sits here, beside the CTA: the button is short
            enough to leave it room, whereas the tall column further down would
            squeeze the copy to a few words per line on a phone. The negative
            margin cancels this block's bottom padding so the cut-out stands on
            the banner's own edge rather than floating above it. */}
        <div className="mt-5 flex items-end justify-between gap-3">
          {href ? (
            <span className={ctaClasses}>{cta}</span>
          ) : (
            <button
              type="button"
              onClick={() =>
                document.getElementById('assistance-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
              className={ctaClasses}
            >
              {cta}
            </button>
          )}

          {MANAGER_PHOTO && (
            <Image
              src={MANAGER_PHOTO}
              alt={t('assistantService.bannerPhotoAlt')}
              width={1000}
              height={1000}
              sizes="9rem"
              className="-mb-6 h-auto w-36 max-w-[40%] object-contain object-bottom sm:hidden"
            />
          )}
        </div>
      </div>

      {MANAGER_PHOTO && (
        <div className="relative z-10 hidden w-72 shrink-0 self-end sm:block lg:w-96">
          <Image
            src={MANAGER_PHOTO}
            alt={t('assistantService.bannerPhotoAlt')}
            width={1000}
            height={1000}
            sizes="(min-width: 1024px) 24rem, 18rem"
            className="h-auto w-full object-contain object-bottom"
          />
        </div>
      )}
    </>
  );

  const shell = clsx(
    'gradient-assisted group relative flex overflow-hidden rounded-2xl border border-[var(--color-gold)]/35 shadow-sm',
    className,
  );

  // A <button> inside an <a> is invalid, so the link form renders its CTA as a
  // span and lets the surrounding anchor carry the click.
  if (href) {
    return (
      <Link href={href} className={clsx(shell, 'transition-colors hover:border-[var(--color-gold)]/70')}>
        {body}
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}
