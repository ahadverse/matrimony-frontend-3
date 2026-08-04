import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useProfileViews } from '@/lib/queries';

export function ProfileViewsSection() {
  const { t } = useLanguage();
  const { data } = useProfileViews();
  const count = data?.count ?? 0;

  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]">
          <Eye size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{t('dashboard.profileViewsTitle')}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{t('dashboard.profileViewsCount', { count })}</p>
        </div>
      </div>
      <Link href="/interests">
        <Button size="md" variant="secondary">
          {t('common.view')} →
        </Button>
      </Link>
    </Card>
  );
}
