'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Copy, Globe, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SupportChatWidget } from '@/components/support/SupportChatWidget';
import { api, ApiError } from '@/lib/api-client';
import { useWallet } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

type Region = 'bd' | 'intl';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { data: wallet } = useWallet();
  const queryClient = useQueryClient();
  const minAmount = wallet?.minTopupAmount ?? 500;

  const [region, setRegion] = useState<Region>('bd');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [amountInput, setAmountInput] = useState<string>(String(minAmount));
  const [trxId, setTrxId] = useState('');
  const [payerAccountNumber, setPayerAccountNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const submitManualBkash = useMutation({
    mutationFn: () =>
      api.post('wallet/topup/bkash/manual', {
        amount: effectiveAmount,
        trxId,
        payerAccountNumber,
      }),
    onSuccess: () => {
      toast.success(t('checkout.manualBkash.submitted'));
      setTrxId('');
      setPayerAccountNumber('');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions-infinite'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not submit transaction'),
  });

  const effectiveAmount = Number(amountInput) || 0;
  const isValid = effectiveAmount >= minAmount;
  const isManualValid = isValid && trxId.trim().length >= 8 && payerAccountNumber.trim().length >= 8;

  const copyMerchantNumber = () => {
    if (!wallet?.bkashMerchantNumber) return;
    void navigator.clipboard.writeText(wallet.bkashMerchantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

          <Card className="flex flex-col gap-3 p-4">
            <p className="text-sm font-semibold text-[var(--color-text)]">{t('checkout.manualBkash.sectionTitle')}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('checkout.manualBkash.instructions', { amount: `${t('common.taka')}${effectiveAmount}` })}
            </p>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
              <div>
                <p className="text-xs text-[var(--color-text-faint)]">{t('checkout.manualBkash.merchantNumberLabel')}</p>
                <p className="font-display text-lg text-[var(--color-text)]">{wallet?.bkashMerchantNumber ?? '—'}</p>
              </div>
              <button
                type="button"
                onClick={copyMerchantNumber}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                <Copy size={14} />
                {copied ? t('checkout.manualBkash.copied') : t('checkout.manualBkash.copy')}
              </button>
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
              value={payerAccountNumber}
              onChange={(e) => setPayerAccountNumber(e.target.value)}
            />

            <Button
              variant="secondary"
              className="w-full"
              disabled={!isManualValid}
              loading={submitManualBkash.isPending}
              onClick={() => submitManualBkash.mutate()}
            >
              {t('checkout.manualBkash.submit')}
            </Button>
            <p className="text-center text-xs text-[var(--color-text-faint)]">{t('checkout.manualBkash.pendingNote')}</p>
          </Card>
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
