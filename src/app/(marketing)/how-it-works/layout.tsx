import type { Metadata } from 'next';
import en from '@/messages/en.json';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { JsonLd, faqSchema } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'How It Works — Register, Verify, Match';
const DESCRIPTION =
  'The five steps from creating a phone-verified account to a proposal your families can act on — what you fill in, what we check, and what each stage costs.';
const PATH = '/how-it-works';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'how matrimony site works',
    'matrimony registration worldwide',
    'biye process online',
    'matrimonial profile verification',
  ],
});

// The five process questions the page renders at the bottom, in page order.
const processFaqs = [1, 2, 3, 4, 5].map((n) => ({
  question: en.howItWorksPage[`q${n}Q` as keyof typeof en.howItWorksPage] as string,
  answer: en.howItWorksPage[`q${n}A` as keyof typeof en.howItWorksPage] as string,
}));

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="How It Works" title={TITLE} description={DESCRIPTION} path={PATH} />
      <JsonLd data={faqSchema(processFaqs)} />
      {children}
    </>
  );
}
