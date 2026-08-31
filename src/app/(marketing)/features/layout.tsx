import type { Metadata } from 'next';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Features — Verification & Privacy Controls';
const DESCRIPTION =
  'Phone-verified accounts, manual profile review, photos blurred until you allow access, country, city, religion and community filters, and wallet top-ups.';
const PATH = '/features';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'matrimony features',
    'verified matrimony platform',
    'private matrimonial profiles',
    'matrimony privacy controls',
  ],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="Features" title={TITLE} description={DESCRIPTION} path={PATH} />
      {children}
    </>
  );
}
