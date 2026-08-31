import type { Metadata } from 'next';
import { privateRouteMetadata } from '@/lib/seo/metadata';

// The mock gateway page lives here. It is a payment-flow stub, not content.
export const metadata: Metadata = { title: 'Checkout', ...privateRouteMetadata };

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
