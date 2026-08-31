import type { Metadata } from 'next';
import { privateRouteMetadata } from '@/lib/seo/metadata';

// OAuth redirect target — never a destination a visitor should arrive at from
// search.
export const metadata: Metadata = { title: 'Signing you in', ...privateRouteMetadata };

export default function CallbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
