'use client';

import { useState, type KeyboardEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import { BadgeCheck, Briefcase, GraduationCap, Heart, MapPin, Ruler } from 'lucide-react';
import type { BrowseCard } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { resolveUploadUrl } from '@/lib/api-client';
import { formatHeight } from '@/lib/height';
import { formatLocation } from '@/lib/geo';
import { useSwipeGesture, type SwipeAction } from './useSwipeGesture';
import { SwipeStamp } from './SwipeStamp';

interface SwipeCardProps {
  card: BrowseCard;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (action: SwipeAction) => void;
}

/**
 * `exit` is a *dynamic* variant: the action that decides which way the card
 * flies is resolved from AnimatePresence's `custom` at removal time.
 *
 * It cannot come from props or state. The commit that picks the direction and
 * the parent update that drops the card from the deck land in the same React
 * batch, so the card never re-renders with the direction set — AnimatePresence
 * freezes the last rendered element, which would always still say "no
 * direction". Reading it from `custom` is the supported way in.
 */
const CARD_VARIANTS: Variants = {
  exit: (action: SwipeAction | null) => {
    switch (action) {
      case 'like':
        return { x: 500, rotate: 20, opacity: 0, transition: { duration: 0.35 } };
      case 'reject':
        return { x: -500, rotate: -20, opacity: 0, transition: { duration: 0.35 } };
      case 'superlike':
        return { y: -600, opacity: 0, transition: { duration: 0.35 } };
      default:
        // Removed without a swipe (filters changed, deck reset) — just fade.
        return { opacity: 0, transition: { duration: 0.2 } };
    }
  },
};

export function SwipeCard({ card, isTop, stackIndex, onSwipe }: SwipeCardProps) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const resolvedPhotoUrl = resolveUploadUrl(card.photoUrl);

  const { x, y, rotate, likeOpacity, nopeOpacity, superOpacity, dragProps } = useSwipeGesture(onSwipe);

  const depthOffset = stackIndex * 10;
  const depthScale = 1 - stackIndex * 0.04;

  function handleKeyDown(e: KeyboardEvent) {
    if (!isTop) return;
    if (e.key === 'ArrowRight') {
      onSwipe('like');
    } else if (e.key === 'ArrowLeft') {
      onSwipe('reject');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onSwipe('superlike');
    }
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 10 - stackIndex }}
      initial={false}
      animate={isTop ? { scale: 1, y: 0 } : { scale: depthScale, y: depthOffset }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      variants={CARD_VARIANTS}
      exit="exit"
    >
      <motion.div
        {...(isTop ? dragProps : {})}
        style={{ x, y, rotate }}
        tabIndex={isTop ? 0 : -1}
        role="group"
        aria-label={`${card.name}${card.age ? `, ${card.age}` : ''}`}
        onKeyDown={handleKeyDown}
        className="surface-card ring-1 ring-inset ring-[var(--color-gold)]/25 relative h-full w-full overflow-hidden rounded-3xl shadow-xl cursor-grab outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <div className="relative h-3/5 w-full overflow-hidden bg-[var(--color-surface)]">
          {resolvedPhotoUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedPhotoUrl}
              alt={card.name}
              className="h-full w-full object-cover"
              draggable={false}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="gradient-primary relative flex h-full w-full items-center justify-center overflow-hidden">
              <Heart
                size={220}
                fill="currentColor"
                strokeWidth={0}
                className="absolute -bottom-10 -right-10 rotate-12 text-[var(--color-gold)]/15"
              />
              <span className="relative font-display text-7xl text-[var(--color-on-primary)] drop-shadow-md">
                {card.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-raised)] via-transparent to-transparent" />
          <hr className="rule-gold absolute inset-x-6 bottom-0" />

          {isTop && (
            <>
              <motion.div style={{ opacity: likeOpacity }} className="absolute left-6 top-6 -rotate-12">
                <SwipeStamp tone="like">{t('browse.like').toUpperCase()}</SwipeStamp>
              </motion.div>
              <motion.div style={{ opacity: nopeOpacity }} className="absolute right-6 top-6 rotate-12">
                <SwipeStamp tone="nope">{t('browse.reject').toUpperCase()}</SwipeStamp>
              </motion.div>
              <motion.div
                style={{ opacity: superOpacity }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2"
              >
                <SwipeStamp tone="super">{t('browse.superlike').toUpperCase()}</SwipeStamp>
              </motion.div>
            </>
          )}
        </div>

        <div className="flex h-2/5 flex-col justify-center gap-2 px-5 py-4">
          <h3 className="flex items-center gap-1.5 font-display text-2xl text-[var(--color-text)]">
            {card.name}
            {card.isVerified && (
              <BadgeCheck size={18} className="shrink-0 text-[var(--color-verified)]" aria-label={t('common.verified')} />
            )}
            {card.age && <span className="ml-1 text-lg text-[var(--color-text-muted)]">{card.age}</span>}
          </h3>
          {card.profession && (
            <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
              <Briefcase size={14} className="shrink-0 text-[var(--color-primary-accent)]" />
              {card.profession}
            </p>
          )}
          {(card.education || card.religion || card.heightCm != null) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
              {card.education && (
                <span className="flex items-center gap-1">
                  <GraduationCap size={13} className="shrink-0 text-[var(--color-primary-accent)]" />
                  {card.education}
                </span>
              )}
              {card.religion && (
                <span className="flex items-center gap-1">
                  <Heart size={13} className="shrink-0 text-[var(--color-primary-accent)]" />
                  {card.religion}
                </span>
              )}
              {card.heightCm != null && (
                <span className="flex items-center gap-1">
                  <Ruler size={13} className="shrink-0 text-[var(--color-primary-accent)]" />
                  {formatHeight(card.heightCm)}
                </span>
              )}
            </div>
          )}
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-text-faint)]">
              <MapPin size={12} />
              {formatLocation(card)}
            </span>
            {card.distanceKm != null && (
              <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-text-faint)]">
                {t('browse.kmAway', { km: card.distanceKm })}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
