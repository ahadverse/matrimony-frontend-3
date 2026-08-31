import type { Metadata } from 'next';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { pageMetadata } from '@/lib/seo/metadata';

// No brand in the title: the root layout appends " | Biye Kora Lagbe" to it, and
// the earlier wording carried the name as well — printing it twice in one SERP
// line and pushing the useful half past the truncation point.
const TITLE = 'Success Stories — Real Marriages';
const DESCRIPTION =
  'How couples in London, Toronto, Dubai and Dhaka met here, involved their families and married — in their own words, across countries and time zones.';
const PATH = '/success-stories';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'matrimony success stories',
    'couples who met online',
    'biye success story',
    'matrimonial site reviews',
  ],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="Success Stories" title={TITLE} description={DESCRIPTION} path={PATH} />
      {children}
    </>
  );
}
