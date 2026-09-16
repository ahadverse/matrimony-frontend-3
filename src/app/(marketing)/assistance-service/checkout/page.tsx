'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api-client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ASSISTANCE_PLANS, type AssistancePlanId } from '../plans';

function AssistanceCheckoutContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const name = searchParams.get('name') ?? '';
  const phone = searchParams.get('phone') ?? '';
  const email = searchParams.get('email') ?? '';
  const profileId = searchParams.get('profileId') ?? '';
  const planId = searchParams.get('plan') as AssistancePlanId | null;
  const plan = ASSISTANCE_PLANS.find((p) => p.id === planId) ?? null;

  const initPaystation = useMutation({
    mutationFn: () =>
      api.post<{ redirectUrl: string }>('assistant-requests/paystation/init', {
        name,
        phone,
        email,
        profileId: profileId || undefined,
        plan: plan?.id,
      }),
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : t('assistantService.formError')),
  });

  if (!plan || !name || !phone || !email) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 pt-20 text-center">
        <h1 className="font-display text-2xl text-[var(--color-text)]">{t('assistantService.formError')}</h1>
        <Link href="/assistance-service">
          <Button>{t('assistantService.planContinue')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 pt-10">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-text)]">{t('assistantService.checkoutTitle')}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {t('assistantService.formSelectedPlanLabel')}: {t(`assistantService.${plan.labelKey}`)} —{' '}
          {t(`assistantService.${plan.priceKey}`)}
        </p>
      </div>

      <Button
        className="w-full"
        loading={initPaystation.isPending}
        onClick={() => initPaystation.mutate()}
      >
        {t('checkout.payWithPaystation')}
      </Button>
    </div>
  );
}

export default function AssistanceCheckoutPage() {
  return (
    <Suspense>
      <AssistanceCheckoutContent />
    </Suspense>
  );
}
