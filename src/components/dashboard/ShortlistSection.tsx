import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useShortlist } from '@/lib/queries';

export function ShortlistSection() {
  const { t } = useLanguage();
  const { data: shortlist } = useShortlist();
  const items = shortlist ?? [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text)]">{t('dashboard.shortlistedTitle')}</p>
        <Link href="/interests?tab=shortlisted" className="text-xs font-medium text-[var(--color-primary-accent)] hover:underline">
          {t('common.seeAll')} →
        </Link>
      </div>
      {items.length === 0 ? (
        <Card className="p-6 text-center text-sm text-[var(--color-text-muted)]">
          {t('dashboard.shortlistedEmpty', { count: 0 })}
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.slice(0, 4).map((p) => (
            <ProfileCard
              key={p.userId}
              userId={p.userId}
              name={p.name}
              location={p}
              photoUrl={p.photoUrl}
              isVerified={p.isVerified}
            />
          ))}
        </div>
      )}
    </div>
  );
}
