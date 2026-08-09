import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useLiveActivity } from '@/lib/queries';
import { formatLocation } from '@/lib/geo';

export function LiveActivityList() {
  const { t } = useLanguage();
  const { data: activeUsers } = useLiveActivity();

  if (!activeUsers || activeUsers.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
        <p className="text-sm font-semibold text-[var(--color-text)]">{t('dashboard.liveActivityTitle')}</p>
      </div>
      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {activeUsers.map((u) => (
          <div key={u.userId} className="flex items-center justify-between py-2.5 text-sm">
            <span className="font-medium text-[var(--color-text)]">
              {u.name}
              {u.age ? `, ${u.age}` : ''}
            </span>
            <span className="text-xs text-[var(--color-text-faint)]">{formatLocation(u)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
