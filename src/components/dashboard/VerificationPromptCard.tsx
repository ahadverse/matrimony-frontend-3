import Link from 'next/link';
import { BadgeCheck, Camera, Clock, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useMyVerification } from '@/lib/queries';

export function VerificationPromptCard() {
  const { t } = useLanguage();
  const { data: verification } = useMyVerification();
  const status = verification?.status;

  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]">
          {status === 'approved' ? <BadgeCheck size={18} /> : status === 'pending' ? <Clock size={18} /> : <ShieldCheck size={18} />}
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{t('dashboard.verifyTitle')}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {status === 'approved'
              ? t('verification.approvedTitle')
              : status === 'pending'
                ? t('verification.pendingTitle')
                : t('dashboard.verifyBody')}
          </p>
        </div>
      </div>
      {status !== 'approved' && (
        <Link href="/verify-selfie">
          <Button size="md" variant={status === 'pending' ? 'secondary' : 'primary'} disabled={status === 'pending'}>
            <Camera size={14} /> {t('dashboard.verifyCta')}
          </Button>
        </Link>
      )}
    </Card>
  );
}
