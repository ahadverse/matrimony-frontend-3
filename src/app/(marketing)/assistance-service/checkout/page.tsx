'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api, ApiError } from '@/lib/api-client';
import { usePublicStats } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ASSISTANCE_PLANS, type AssistancePlanId } from '../plans';

// Mirrors the backend's own validation for these proof fields
// (wallet/dto/submit-manual-bkash.dto.ts and assistant-requests' own DTO).
const TRX_ID_PATTERN = /^[A-Z0-9]{8,12}$/;
const PAYER_NUMBER_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;

function AssistanceCheckoutContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const { data: publicStats } = usePublicStats();

  const name = searchParams.get('name') ?? '';
  const phone = searchParams.get('phone') ?? '';
  const email = searchParams.get('email') ?? '';
  const profileId = searchParams.get('profileId') ?? '';
  const planId = searchParams.get('plan') as AssistancePlanId | null;
  const plan = ASSISTANCE_PLANS.find((p) => p.id === planId) ?? null;

  const [trxId, setTrxId] = useState('');
  const [payerNumber, setPayerNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const trimmedTrxId = trxId.trim().toUpperCase();
  const trimmedPayerNumber = payerNumber.trim();
  const isManualValid = TRX_ID_PATTERN.test(trimmedTrxId) && PAYER_NUMBER_PATTERN.test(trimmedPayerNumber);

  const submit = useMutation({
    mutationFn: () =>
      api.post<{ kind: 'assistant_request' | 'contact_message' }>('assistant-requests', {
        name,
        phone,
        email,
        profileId: profileId || undefined,
        plan: plan?.id,
        trxId: trimmedTrxId,
        payerAccountNumber: trimmedPayerNumber,
      }),
    onSuccess: () => setSubmitted(true),
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : t('assistantService.formError')),
  });

  function handleCopyMerchantNumber() {
    if (!publicStats?.bkashMerchantNumber) return;
    navigator.clipboard.writeText(publicStats.bkashMerchantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 pt-20 text-center">
        <CheckCircle2 size={56} className="text-[var(--color-success)]" />
        <h1 className="font-display text-2xl text-[var(--color-text)]">{t('assistantService.formSuccessPaid')}</h1>
        <Link href="/assistance-service">
          <Button>{t('assistantService.planContinue')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 pt-10">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-text)]">{t('assistantService.manualBkashToggleLabel')}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {t('assistantService.formSelectedPlanLabel')}: {t(`assistantService.${plan.labelKey}`)} —{' '}
          {t(`assistantService.${plan.priceKey}`)}
        </p>
      </div>

      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('assistantService.manualBkashInstructions', { amount: t(`assistantService.${plan.priceKey}`) })}
        </p>

        <div>
          <p className="mb-1.5 text-sm font-medium text-[var(--color-text-muted)]">
            {t('checkout.manualBkash.merchantNumberLabel')}
          </p>
          <div className="flex h-12 items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
            <span className="font-display text-lg text-[var(--color-text)]">
              {publicStats?.bkashMerchantNumber ?? '—'}
            </span>
            <button
              type="button"
              onClick={handleCopyMerchantNumber}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary-accent)] hover:underline"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t('checkout.manualBkash.copied') : t('checkout.manualBkash.copy')}
            </button>
          </div>
        </div>

        <Input
          label={t('checkout.manualBkash.trxIdLabel')}
          placeholder={t('checkout.manualBkash.trxIdPlaceholder')}
          value={trxId}
          onChange={(e) => setTrxId(e.target.value)}
        />

        <Input
          label={t('checkout.manualBkash.payerNumberLabel')}
          placeholder={t('checkout.manualBkash.payerNumberPlaceholder')}
          value={payerNumber}
          onChange={(e) => setPayerNumber(e.target.value)}
        />

        <Button
          onClick={() => submit.mutate()}
          loading={submit.isPending}
          disabled={!isManualValid || submit.isPending}
        >
          {t('assistantService.manualBkashSubmit')}
        </Button>

        <p className="text-xs text-[var(--color-text-faint)]">{t('assistantService.manualBkashPendingNote')}</p>
      </Card>
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
