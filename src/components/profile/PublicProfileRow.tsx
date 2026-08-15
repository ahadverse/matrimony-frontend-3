'use client';

import Link from 'next/link';
import { BadgeCheck, Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { resolveUploadUrl } from '@/lib/api-client';
import { formatHeight } from '@/lib/height';
import { formatLocation } from '@/lib/geo';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { PublicProfileCard } from '@/lib/types';

interface PublicProfileRowProps {
  profile: PublicProfileCard;
  /** Formatted unlock price, or null while the wallet settings are loading. */
  unlockCost: string | null;
  onUnlock: () => void;
  unlocking: boolean;
}

/**
 * One row of the public directory.
 *
 * A locked row is headed by the profile's public id rather than a name, and
 * its photo is the blurred variant the API returned — there is no unblurred
 * URL in the payload to accidentally render.
 */
export function PublicProfileRow({ profile, unlockCost, onUnlock, unlocking }: PublicProfileRowProps) {
  const { t } = useLanguage();
  const photo = resolveUploadUrl(profile.photoUrl);
  const heading = profile.locked
    ? (profile.publicId ?? t('profileDetail.lockedHiddenName'))
    : profile.name;

  const stats: [string, string | null][] = [
    [t('profiles.age'), profile.age ? `${profile.age} ${t('common.years')}` : null],
    [t('profiles.height'), formatHeight(profile.heightCm)],
    [t('profiles.religion'), profile.religion],
    [t('profiles.maritalStatus'), t(`profileDetail.${profile.maritalStatus}`)],
    [t('profiles.education'), profile.education],
    [t('profiles.workingSector'), profile.workingSector ?? t('profiles.notWorking')],
  ];

  return (
    <Card className="flex flex-col gap-4 overflow-hidden p-4 sm:flex-row">
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface)] sm:h-44 sm:w-36">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-[var(--color-text-faint)]">
            {heading.charAt(0)}
          </div>
        )}

        {profile.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[var(--color-scrim)] px-2 text-center">
            <Lock size={18} className="text-[var(--color-on-primary)]" />
            <span className="text-[10px] font-semibold leading-tight text-[var(--color-on-primary)]">
              {t('profiles.premiumOverlay')}
            </span>
          </div>
        )}

        {profile.isSpotlighted && (
          <span className="gradient-gold absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-[var(--color-on-gold)]">
            <Sparkles size={10} /> Spotlight
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/profile/${profile.userId}`}
            className="font-display text-lg text-[var(--color-primary-accent)] hover:underline"
          >
            {heading}
          </Link>
          {profile.isVerified && (
            <BadgeCheck size={16} className="text-[var(--color-verified)]" aria-label={t('common.verified')} />
          )}
          {!profile.locked && <Badge tone="success">{t('profiles.unlocked')}</Badge>}
        </div>

        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {stats
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="shrink-0 text-[var(--color-text-faint)]">{label}</dt>
                <dd className="truncate text-right font-medium text-[var(--color-text)]">{value}</dd>
              </div>
            ))}
        </dl>

        <p className="mt-2 truncate text-xs text-[var(--color-text-faint)]">{formatLocation(profile)}</p>

        {profile.bio && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">{profile.bio}</p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          {profile.locked ? (
            <Button variant="gold" size="md" onClick={onUnlock} loading={unlocking}>
              <Lock size={14} />
              {unlockCost ? t('profiles.unlockFor', { cost: unlockCost }) : t('profiles.unlock')}
            </Button>
          ) : (
            <Link href={`/profile/${profile.userId}`}>
              <Button size="md">{t('profiles.viewProfile')}</Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
