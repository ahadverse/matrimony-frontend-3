'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api-client';
import { useWallet } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { data: wallet } = useWallet();
  const minAmount = wallet?.minTopupAmount ?? 500;

  const [amount, setAmount] = useState<number>(minAmount);
  const [customAmount, setCustomAmount] = useState('');

  const initTopup = useMutation({
    mutationFn: (provider: 'bkash' | 'nagad') => api.post<{ redirectUrl: string }>(`wallet/topup/${provider}/init`, { amount }),
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not start checkout'),
  });

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const isValid = effectiveAmount >= minAmount;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-text)]">{t('checkout.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('checkout.subtitle')}</p>
        </div>
        <Link
          href="/checkout/history"
          className="shrink-0 whitespace-nowrap text-xs font-medium text-[var(--color-primary-accent)] hover:underline"
        >
          {t('checkout.viewFullHistory')}
        </Link>
      </div>

      <Card className="gradient-gold p-4 text-center">
        <p className="text-xs uppercase tracking-wide text-[var(--color-on-gold)]/70">{t('checkout.currentBalance')}</p>
        <p className="font-display mt-1 text-3xl text-[var(--color-on-gold)]">
          {t('common.taka')}
          {wallet?.balance ?? 0}
        </p>
      </Card>

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">{t('checkout.amount')}</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setAmount(preset);
                setCustomAmount('');
              }}
              className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                !customAmount && amount === preset
                  ? 'gradient-primary border-transparent text-[var(--color-on-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Input
            label={t('checkout.customAmount')}
            type="number"
            min={minAmount}
            placeholder={String(minAmount)}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />
        </div>
        <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">
          {t('checkout.minAmount', { amount: `${t('common.taka')}${minAmount}` })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className="w-full !bg-[#e2136e] !bg-none"
          disabled={!isValid}
          loading={initTopup.isPending}
          onClick={() => {
            setAmount(effectiveAmount);
            initTopup.mutate('bkash');
          }}
        >
          {t('checkout.payWithBkash')}
        </Button>
        <Button
          variant="secondary"
          className="w-full !border-[#f6921e] !text-[#f6921e]"
          disabled={!isValid}
          loading={initTopup.isPending}
          onClick={() => {
            setAmount(effectiveAmount);
            initTopup.mutate('nagad');
          }}
        >
          {t('checkout.payWithNagad')}
        </Button>
      </div>
    </div>
  );
}
