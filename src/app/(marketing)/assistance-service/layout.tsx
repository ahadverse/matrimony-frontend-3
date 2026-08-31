import type { Metadata } from 'next';
import en from '@/messages/en.json';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { JsonLd, faqSchema, serviceSchema } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { ASSISTANCE_PLANS } from './plans';

const TITLE = 'Assisted Matchmaking — A Dedicated Advisor';
const DESCRIPTION =
  'A dedicated advisor shortlists candidates worldwide against your criteria, confirms the particulars, and introduces both families. Plans from ৳20,000.';
const PATH = '/assistance-service';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'matchmaking service worldwide',
    'ghotok service online',
    'assisted matrimony service',
    'international marriage media',
  ],
});

const serviceFaqs = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  question: en.assistantService[`faq${n}Q` as keyof typeof en.assistantService] as string,
  answer: en.assistantService[`faq${n}A` as keyof typeof en.assistantService] as string,
}));

// Built from the same plan list the page renders. JSON-LD is never localised,
// so the offer names come straight out of the English catalogue rather than
// through the runtime `t()` helper.
const offers = ASSISTANCE_PLANS.map((plan) => ({
  name: en.assistantService[plan.labelKey],
  price: plan.price,
}));

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="Assistance Service" title={TITLE} description={DESCRIPTION} path={PATH} />
      <JsonLd
        data={serviceSchema({
          name: 'Biye Kora Lagbe Assisted Matchmaking Service',
          description: DESCRIPTION,
          path: PATH,
          offers,
        })}
      />
      <JsonLd data={faqSchema(serviceFaqs)} />
      {children}
    </>
  );
}
