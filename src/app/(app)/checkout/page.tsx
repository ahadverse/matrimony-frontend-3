'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Globe, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SupportChatWidget } from '@/components/support/SupportChatWidget';
import { api, ApiError } from '@/lib/api-client';
import { useWallet } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

// First rung is the minimum top-up itself (AppSettings.minTopupAmount), so the
// cheapest option on screen is always one the server will accept.
const PRESET_AMOUNTS = [100, 500, 1000, 2000];

type Region = 'bd' | 'intl';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { data: wallet } = useWallet();
  // Only the pre-fetch placeholder — the real floor is whatever the server
  // reports, since an admin can change it from the settings panel.
  const minAmount = wallet?.minTopupAmount ?? 100;

  const [region, setRegion] = useState<Region>('bd');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [amountInput, setAmountInput] = useState<string>(String(minAmount));

  const effectiveAmount = Number(amountInput) || 0;
  const isValid = effectiveAmount >= minAmount;

  const initTopup = useMutation({
    mutationFn: () =>
      api.post<{ redirectUrl: string }>('wallet/topup/paystation/init', {
        amount: effectiveAmount,
      }),
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not start checkout'),
  });

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
        <p className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">{t('checkout.region.label')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setRegion('bd')}
            className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${
              region === 'bd'
                ? 'gradient-primary border-transparent text-[var(--color-on-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            <MapPin size={16} />
            {t('checkout.region.bangladesh')}
          </button>
          <button
            onClick={() => setRegion('intl')}
            className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${
              region === 'intl'
                ? 'gradient-primary border-transparent text-[var(--color-on-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            <Globe size={16} />
            {t('checkout.region.international')}
          </button>
        </div>
      </div>

      {region === 'bd' ? (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">{t('checkout.amount')}</p>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmountInput(String(preset))}
                  className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    effectiveAmount === preset
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
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">
              {t('checkout.minAmount', { amount: `${t('common.taka')}${minAmount}` })}
            </p>
          </div>

          <Button
            className="w-full"
            disabled={!isValid}
            loading={initTopup.isPending}
            onClick={() => initTopup.mutate()}
          >
            {t('checkout.payWithPaystation')}
          </Button>
        </>
      ) : (
        <>
          <Card className="flex flex-col gap-3 p-4 text-center">
            <p className="text-sm font-semibold text-[var(--color-text)]">{t('checkout.international.title')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{t('checkout.international.body')}</p>
            <Button className="w-full" onClick={() => setIsSupportOpen(true)}>
              {t('checkout.international.cta')}
            </Button>
          </Card>
          <SupportChatWidget isOpen={isSupportOpen} onOpenChange={setIsSupportOpen} />
        </>
      )}
    </div>
  );
}
