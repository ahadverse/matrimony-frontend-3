import type { Metadata } from 'next';
import en from '@/messages/en.json';
import { LandingPage } from '@/components/marketing/LandingPage';
import { JsonLd, faqSchema, webPageSchema } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { SITE_KEYWORDS } from '@/lib/seo/site';

const TITLE = 'Biye Kora Lagbe — Verified Matrimony Worldwide';
const DESCRIPTION =
  'Find a life partner, wherever your family is. Every profile is phone-verified and reviewed by our team. Search brides and grooms by country and religion.';

// `absoluteTitle` because the title already carries the brand — the root
// layout's "%s | Biye Kora Lagbe" template would otherwise print it twice.
export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/',
  keywords: SITE_KEYWORDS,
  absoluteTitle: true,
});

// Built from the same dictionary the page renders, so the rich result can never
// claim an answer the visitor does not actually see on the page.
const homeFaqs = [1, 2, 3, 4, 5].map((n) => ({
  question: en.landing[`faq${n}Q` as keyof typeof en.landing] as string,
  answer: en.landing[`faq${n}A` as keyof typeof en.landing] as string,
}));

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ name: TITLE, description: DESCRIPTION, path: '/' })} />
      <JsonLd data={faqSchema(homeFaqs)} />
      <LandingPage />
    </>
  );
}
