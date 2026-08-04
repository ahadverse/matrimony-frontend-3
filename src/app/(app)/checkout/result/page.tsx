'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function ResultContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const success = searchParams.get('status') === 'success';

  if (success) queryClient.invalidateQueries({ queryKey: ['wallet'] });

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 pt-20 text-center">
      {success ? (
        <CheckCircle2 size={56} className="text-[var(--color-success)]" />
      ) : (
        <XCircle size={56} className="text-[var(--color-danger)]" />
      )}
      <h1 className="font-display text-2xl text-[var(--color-text)]">
        {success ? t('checkout.resultSuccessTitle') : t('checkout.resultFailedTitle')}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        {success ? t('checkout.resultSuccessBody') : t('checkout.resultFailedBody')}
      </p>
      <Button className="w-full" onClick={() => router.push('/checkout')}>
        {t('checkout.backToWallet')}
      </Button>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
