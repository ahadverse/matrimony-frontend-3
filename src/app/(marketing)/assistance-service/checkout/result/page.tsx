'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

// Public on purpose, unlike /checkout/result — the visitor PayStation redirects
// here has no session (see AssistantRequestsService.initPaystation), so this
// can't live under the session-gated /checkout prefix in proxy.ts.
function AssistanceResultContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const success = searchParams.get('status') === 'success';

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 pt-20 text-center">
      {success ? (
        <CheckCircle2 size={56} className="text-[var(--color-success)]" />
      ) : (
        <XCircle size={56} className="text-[var(--color-danger)]" />
      )}
      <h1 className="font-display text-2xl text-[var(--color-text)]">
        {success ? t('assistantService.resultSuccessTitle') : t('assistantService.resultFailedTitle')}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        {success ? t('assistantService.resultSuccessBody') : t('assistantService.resultFailedBody')}
      </p>
      <Link href="/assistance-service" className="w-full">
        <Button className="w-full">{t('assistantService.planContinue')}</Button>
      </Link>
    </div>
  );
}

export default function AssistanceCheckoutResultPage() {
  return (
    <Suspense>
      <AssistanceResultContent />
    </Suspense>
  );
}
