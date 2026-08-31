import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';

// A sign-in form has nothing to rank for and competes with /register for the
// brand query, so it is deliberately kept out of the index.
export const metadata: Metadata = pageMetadata({
  title: 'Sign In',
  description: 'Sign in to your Biye Kora Lagbe account to continue your search.',
  path: '/login',
  noindex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
