import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function WelcomeBanner({ name }: { name: string }) {
  const { t } = useLanguage();
  return (
    <div className="gradient-primary flex flex-col gap-4 rounded-2xl p-6 text-[var(--color-on-primary)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--color-on-primary)]/70">{t('dashboard.welcomeEyebrow')}</p>
        <h1 className="font-display mt-1 text-2xl">{t('dashboard.welcomeTitle', { name })}</h1>
        <p className="mt-1 text-sm text-[var(--color-on-primary)]/80">{t('dashboard.welcomeBody')}</p>
      </div>
      <div className="flex gap-2">
        <Link href="/edit-profile">
          <Button size="md" className="!bg-white !bg-none !text-[var(--color-primary-accent)]">
            {t('dashboard.editProfileCta')}
          </Button>
        </Link>
        <Link href="/edit-profile?tab=photos">
          <Button size="md" variant="secondary" className="!border-[var(--color-on-primary)]/50 !text-[var(--color-on-primary)]">
            {t('dashboard.viewProfileCta')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
