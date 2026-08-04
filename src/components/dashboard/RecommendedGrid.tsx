'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Heart } from 'lucide-react';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useBrowseFeed, useSwipeMutation } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';

export function RecommendedGrid() {
  const { t } = useLanguage();
  const { data: feed } = useBrowseFeed({}, true);
  const items = (feed ?? []).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text)]">{t('dashboard.recommendedTitle')}</p>
        <Link href="/browse" className="text-xs font-medium text-[var(--color-primary-accent)] hover:underline">
          {t('common.seeAll')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((card) => (
          <ProfileCard
            key={card.id}
            userId={card.id}
            name={card.name}
            district={card.district}
            subDistrict={card.subDistrict}
            age={card.age}
            photoUrl={card.photoUrl}
            isVerified={card.isVerified}
            footer={<SendInterestButton targetId={card.id} name={card.name} />}
          />
        ))}
      </div>
    </div>
  );
}

function SendInterestButton({ targetId, name }: { targetId: string; name: string }) {
  const { t } = useLanguage();
  const swipe = useSwipeMutation();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <span className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-success-tint)] py-1.5 text-xs font-medium text-[var(--color-success)]">
        <Check size={13} /> {t('interests.interestSent')}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        swipe.mutate(
          { targetId, action: 'like' },
          {
            onSuccess: (res) => {
              setSent(true);
              toast.success(res.matched ? t('browse.newMatchToast', { name }) : t('browse.likedToast', { name }));
            },
            onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not send interest'),
          },
        )
      }
      disabled={swipe.isPending}
      className="gradient-primary flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold text-[var(--color-on-primary)] transition-colors hover:brightness-110 disabled:opacity-60"
    >
      <Heart size={13} />
      {t('browse.sendInterest')}
    </button>
  );
}
