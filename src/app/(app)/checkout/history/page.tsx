'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { useWalletTransactionsInfinite } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { WalletTransaction } from '@/lib/types';

type Filter = 'all' | 'topup';

export default function TopUpHistoryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useWalletTransactionsInfinite(
    filter === 'topup' ? 'topup' : undefined,
  );

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="w-full -mx-2 sm:mx-auto sm:max-w-2xl">
      <button
        onClick={() => router.back()}
        className="mb-3 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <h1 className="font-display mb-4 text-2xl text-[var(--color-text)]">{t('checkout.history.title')}</h1>

      <div className="mb-4 flex gap-1 rounded-full bg-[var(--color-surface)] p-1">
        {(['all', 'topup'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-full py-2 text-xs font-medium transition-colors ${
              filter === f ? 'gradient-primary text-[var(--color-on-primary)]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            {f === 'all' ? t('checkout.history.filterAll') : t('checkout.history.filterTopupsOnly')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="pt-16 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 pt-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-faint)]">
            <Receipt size={28} />
          </div>
          <p className="max-w-[220px] text-sm text-[var(--color-text-muted)]">{t('checkout.history.empty')}</p>
        </div>
      ) : (
        <>
          <StaggerList className="flex flex-col gap-2">
            {items.map((txn) => (
              <StaggerItem key={txn.id}>
                <TransactionRow txn={txn} />
              </StaggerItem>
            ))}
          </StaggerList>

          {hasNextPage && (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => fetchNextPage()}
              loading={isFetchingNextPage}
            >
              {t('checkout.history.loadMore')}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function TransactionRow({ txn }: { txn: WalletTransaction }) {
  return (
    <Card className="flex items-center justify-between p-3">
      <div>
        <p className="text-sm font-medium capitalize text-[var(--color-text)]">{txn.type.replace('_', ' ')}</p>
        <p className="text-xs text-[var(--color-text-faint)]">
          {new Date(txn.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          {txn.provider && ` · ${txn.provider}`}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-semibold ${txn.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
        >
          {txn.amount >= 0 ? '+' : ''}
          {txn.amount}
        </p>
        <p className="text-xs capitalize text-[var(--color-text-faint)]">{txn.status}</p>
      </div>
    </Card>
  );
}
