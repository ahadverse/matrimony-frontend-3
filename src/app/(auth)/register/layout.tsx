import type { Metadata } from 'next';
import Link from 'next/link';
import en from '@/messages/en.json';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Create Your Free Account';
const DESCRIPTION =
  'Register free. Verify your phone number, build a profile our team reviews before it goes live, and start meeting verified brides and grooms worldwide.';
const PATH = '/register';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'matrimony registration worldwide',
    'free matrimonial account',
    'create biye profile',
    'sign up matrimony site',
  ],
});

const sections = [
  { titleKey: 'needTitle', bodyKey: 'needBody' },
  { titleKey: 'reviewTitle', bodyKey: 'reviewBody' },
  { titleKey: 'privacyTitle', bodyKey: 'privacyBody' },
] as const;

/**
 * The wizard itself is a client component that renders one step at a time, so
 * the page's entire crawlable body was a heading and a button — a few hundred
 * characters on a route that is in the sitemap and does get brand-plus-
 * "registration" searches. The prose below sits under the form, is part of the
 * static HTML, and answers what someone actually wants to know before they
 * hand over a phone number.
 */
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="Register" title={TITLE} description={DESCRIPTION} path={PATH} />
      {children}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16 pt-4" aria-labelledby="register-info">
        <h2 id="register-info" className="font-display text-xl text-[var(--color-text)]">
          {en.registerInfo.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{en.registerInfo.body}</p>

        <div className="mt-8 flex flex-col gap-6">
          {sections.map(({ titleKey, bodyKey }) => (
            <div key={titleKey}>
              <h3 className="font-display text-base text-[var(--color-text)]">{en.registerInfo[titleKey]}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {en.registerInfo[bodyKey]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/how-it-works" className="font-medium text-[var(--color-primary-accent)] hover:underline">
            {en.registerInfo.linkHowItWorks} →
          </Link>
          <Link href="/faq" className="font-medium text-[var(--color-primary-accent)] hover:underline">
            {en.registerInfo.linkFaq} →
          </Link>
          <Link href="/terms" className="font-medium text-[var(--color-primary-accent)] hover:underline">
            {en.registerInfo.linkTerms} →
          </Link>
        </div>
      </section>
    </>
  );
}
