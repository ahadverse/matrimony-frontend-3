'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { Camera, ChevronRight, MessageCircle, Sparkles, User, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useActivateSpotlight, useMyProfile, useWallet } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';

export function QuickActionsList() {
  const { t } = useLanguage();
  const { data: profile } = useMyProfile();
  const { data: wallet } = useWallet();
  const spotlight = useActivateSpotlight();

  const spotlightActive = profile?.spotlightUntil && new Date(profile.spotlightUntil).getTime() > Date.now();

  const rows = [
    { href: '/edit-profile', icon: User, label: t('dashboard.actionEditProfile') },
    { href: '/edit-profile?tab=photos', icon: Camera, label: t('dashboard.actionAddPhotos') },
    { href: '/inbox', icon: MessageCircle, label: t('dashboard.actionMessages') },
    { href: '/checkout', icon: Wallet, label: t('dashboard.actionTopUp') },
  ] as const;

  return (
    <Card className="p-2">
      <p className="px-3 pt-2 pb-1 text-sm font-semibold text-[var(--color-text)]">{t('dashboard.quickActionsTitle')}</p>
      <div className="flex flex-col">
        {rows.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            <span className="flex items-center gap-2.5">
              <Icon size={16} className="text-[var(--color-primary-accent)]" /> {label}
            </span>
            <ChevronRight size={15} className="text-[var(--color-text-faint)]" />
          </Link>
        ))}
        <button
          type="button"
          disabled={spotlight.isPending || !!spotlightActive}
          onClick={() =>
            spotlight.mutate(undefined, {
              onSuccess: () => toast.success(t('dashboard.spotlightSuccess')),
              onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : t('dashboard.spotlightError')),
            })
          }
          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--color-primary-accent)] hover:bg-[var(--color-primary-tint)] disabled:opacity-60"
        >
          <span className="flex items-center gap-2.5">
            <Sparkles size={16} />
            {t('dashboard.actionSpotlight')}
          </span>
          <span className="text-xs font-normal text-[var(--color-text-faint)]">
            {spotlightActive
              ? t('dashboard.spotlightActive')
              : t('dashboard.spotlightHint', { cost: wallet?.spotlightCost ?? 150, hours: wallet?.spotlightDurationHours ?? 24 })}
          </span>
        </button>
      </div>
    </Card>
  );
}
