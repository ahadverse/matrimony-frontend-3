import type { Metadata } from 'next';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { pageMetadata } from '@/lib/seo/metadata';

// Matches the heading the page renders — a title that promises "Terms of
// Service" and lands on "Terms & Conditions" is a small mismatch, but it is the
// kind Google flags as a title-content discrepancy and rewrites.
const TITLE = 'Terms & Conditions';
const DESCRIPTION =
  'The terms governing your use of Biye Kora Lagbe: eligibility, acceptable conduct, profile accuracy, payments and wallet credits, suspension, and liability.';
const PATH = '/terms';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="Terms & Conditions" title={TITLE} description={DESCRIPTION} path={PATH} />
      {children}
    </>
  );
}
