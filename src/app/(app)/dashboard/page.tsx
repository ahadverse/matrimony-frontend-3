'use client';

import Link from 'next/link';
import { BadgeCheck, Gamepad2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CompletionPanel } from '@/components/profile/CompletionPanel';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatTilesRow } from '@/components/dashboard/StatTilesRow';
import { VerificationPromptCard } from '@/components/dashboard/VerificationPromptCard';
import { LiveActivityList } from '@/components/dashboard/LiveActivityList';
import { RecommendedGrid } from '@/components/dashboard/RecommendedGrid';
import { QuickActionsList } from '@/components/dashboard/QuickActionsList';
import { ShortlistSection } from '@/components/dashboard/ShortlistSection';
import { ProfileViewsSection } from '@/components/dashboard/ProfileViewsSection';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useConversations, useMyProfile } from '@/lib/queries';
import { resolveUploadUrl } from '@/lib/api-client';
import { formatLocation } from '@/lib/geo';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: profile } = useMyProfile();
  const { data: conversations } = useConversations();

  const firstMatch = conversations?.[0];
  const matchPhoto = resolveUploadUrl(firstMatch?.otherUser?.photoUrl);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <WelcomeBanner name={profile?.name?.split(' ')[0] ?? ''} />

        <VerificationPromptCard />

        {/* "A Day Together" — static/coming-soon per scope, shown in place */}
        <Card className="gradient-primary flex items-center justify-between gap-4 p-5 text-[var(--color-on-primary)]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-on-primary)]/15">
              <Gamepad2 size={20} />
            </span>
            <div>
              <p className="font-display text-base">{t('dashboard.dayTogetherTitle')}</p>
              <p className="text-xs text-[var(--color-on-primary)]/80">{t('dashboard.dayTogetherBody')}</p>
            </div>
          </div>
          <Button size="md" variant="gold" disabled>
            {t('dashboard.dayTogetherCta')}
          </Button>
        </Card>

        <StatTilesRow />

        {firstMatch && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{t('dashboard.mutualMatchesTitle')}</p>
                <p className="text-xs text-[var(--color-text-faint)]">{t('dashboard.mutualMatchesBody')}</p>
              </div>
              <Link href="/interests?tab=received" className="text-xs font-medium text-[var(--color-primary-accent)] hover:underline">
                {t('common.seeAll')} →
              </Link>
            </div>
            <Card className="max-w-xs overflow-hidden p-0">
              <Link href={`/inbox/${firstMatch.id}`} className="block aspect-[4/5] w-full bg-[var(--color-surface)]">
                {matchPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={matchPhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--color-text-faint)]">
                    {firstMatch.otherUser?.name?.[0]}
                  </div>
                )}
              </Link>
              <div className="p-3">
                <p className="flex items-center gap-1 text-sm font-medium text-[var(--color-text)]">
                  <span className="truncate">{firstMatch.otherUser?.name}</span>
                  {firstMatch.otherUser?.isVerified && (
                    <BadgeCheck size={14} className="shrink-0 text-[var(--color-verified)]" aria-label={t('common.verified')} />
                  )}
                </p>
                <p className="text-xs text-[var(--color-text-faint)]">{formatLocation(firstMatch.otherUser)}</p>
              </div>
            </Card>
          </div>
        )}

        <LiveActivityList />
        <RecommendedGrid />
        <ShortlistSection />
        <ProfileViewsSection />
      </div>

      <div className="flex flex-col gap-6">
        {profile && <CompletionPanel percent={profile.completionPercent} missingFields={profile.missingFields} />}
        <QuickActionsList />
      </div>
    </div>
  );
}
