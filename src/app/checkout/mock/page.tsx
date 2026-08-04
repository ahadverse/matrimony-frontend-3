'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BACKEND_URL } from '@/lib/api-client';

function MockCheckoutContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider') ?? 'bkash';
  const ref = searchParams.get('ref') ?? '';
  const amount = searchParams.get('amount') ?? '0';

  function go(status: 'success' | 'failed') {
    window.location.href = `${BACKEND_URL}/wallet/topup/${provider}/callback?ref=${encodeURIComponent(ref)}&status=${status}&amount=${amount}`;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] px-6">
      <Card className="w-full max-w-sm p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Sandbox checkout simulator</p>
        <h1 className="font-display mt-2 text-2xl capitalize text-[var(--color-text)]">{provider}</h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          No live {provider} credentials are configured for this app yet, so this simulates the gateway locally.
        </p>
        <p className="font-display mt-4 text-3xl text-[var(--color-primary-accent)]">৳{amount}</p>

        <div className="mt-6 flex flex-col gap-3">
          <Button className="w-full" onClick={() => go('success')}>
            Simulate successful payment
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => go('failed')}>
            Simulate failed payment
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense>
      <MockCheckoutContent />
    </Suspense>
  );
}
