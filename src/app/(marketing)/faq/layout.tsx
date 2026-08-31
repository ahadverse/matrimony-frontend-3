import type { Metadata } from 'next';
import en from '@/messages/en.json';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { JsonLd, faqSchema } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { faqCategoryKeys } from '@/lib/faqCategories';

const TITLE = 'Frequently Asked Questions';
const DESCRIPTION =
  'Answers on registering from any country, phone and photo verification, who can see your photos, how interests and messaging work, and how top-ups work.';
const PATH = '/faq';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'matrimony site FAQ',
    'Biye Kora Lagbe help',
    'matrimony account verification',
    'matrimony payment bKash',
  ],
});

// Google requires that every question in an FAQPage block be visible on the
// page, so both the schema and the accordions are generated from the same
// category shape and the same dictionary — never retyped.
const faqEntries = faqCategoryKeys().flatMap((category) =>
  category.items.map(({ qKey, aKey }) => ({
    question: en.faqPage[qKey.replace('faqPage.', '') as keyof typeof en.faqPage] as string,
    answer: en.faqPage[aKey.replace('faqPage.', '') as keyof typeof en.faqPage] as string,
  })),
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="FAQ" title={TITLE} description={DESCRIPTION} path={PATH} />
      <JsonLd data={faqSchema(faqEntries)} />
      {children}
    </>
  );
}
