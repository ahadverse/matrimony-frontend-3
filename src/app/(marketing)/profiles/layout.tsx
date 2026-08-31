import type { Metadata } from 'next';
import Link from 'next/link';
import en from '@/messages/en.json';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { collectionPageSchema } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import {
  FEATURED_COUNTRIES,
  MARITAL_STATUSES,
  PROFESSIONAL_AREAS,
  QUALIFICATIONS,
  RELIGIONS,
} from '@/lib/profileOptions';

const TITLE = 'Verified Bride & Groom Profiles';
const DESCRIPTION =
  'Browse phone-verified bride and groom profiles from around the world. Filter by age, country, religion, education, profession and marital status.';
const PATH = '/profiles';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'bride profiles',
    'groom profiles',
    'patro patri',
    'verified matrimonial profiles',
    'international marriage profiles',
  ],
});

/**
 * Every facet below is a query string on this same route, and `pageMetadata`
 * gives all of them the one canonical `/profiles`. That is deliberate: the
 * filtered views are worth linking for discovery and for visitors, but they are
 * near-duplicates of each other, and letting a crawler index a few hundred of
 * them would spend the whole crawl budget on thin pages.
 */
const facetGroups = [
  {
    id: 'gender',
    heading: en.profiles.hubGenderTitle,
    body: en.profiles.hubGenderBody,
    links: [
      { label: 'Bride profiles (women)', href: '/profiles?gender=female' },
      { label: 'Groom profiles (men)', href: '/profiles?gender=male' },
    ],
  },
  {
    id: 'country',
    heading: en.profiles.hubDivisionTitle,
    body: en.profiles.hubDivisionBody,
    // A shortlist, not a restriction — members register from any of the 250
    // countries in the geo dataset, and the filters go down to state and city.
    links: FEATURED_COUNTRIES.map((country) => ({
      label: country,
      href: `/profiles?country=${encodeURIComponent(country)}`,
    })),
  },
  {
    id: 'religion',
    heading: en.profiles.hubReligionTitle,
    body: en.profiles.hubReligionBody,
    links: RELIGIONS.map((religion) => ({
      label: religion,
      href: `/profiles?religion=${encodeURIComponent(religion)}`,
    })),
  },
  {
    id: 'education',
    heading: en.profiles.hubEducationTitle,
    body: en.profiles.hubEducationBody,
    links: QUALIFICATIONS.map((qualification) => ({
      label: qualification,
      href: `/profiles?education=${encodeURIComponent(qualification)}`,
    })),
  },
  {
    id: 'profession',
    heading: en.profiles.hubProfessionTitle,
    body: en.profiles.hubProfessionBody,
    links: PROFESSIONAL_AREAS.map((area) => ({
      label: area,
      href: `/profiles?profession=${encodeURIComponent(area)}`,
    })),
  },
  {
    id: 'status',
    heading: en.profiles.hubStatusTitle,
    body: en.profiles.hubStatusBody,
    links: MARITAL_STATUSES.map((status) => ({
      // The API stores these lowercase; the label is what a visitor reads.
      label: status.charAt(0).toUpperCase() + status.slice(1),
      href: `/profiles?maritalStatus=${encodeURIComponent(status)}`,
    })),
  },
] as const;

/**
 * The directory itself reads `useSearchParams`, so the whole page sits behind a
 * Suspense boundary and is excluded from the prerendered HTML — a crawler that
 * does not run JavaScript would otherwise see nothing but the loading state.
 * Everything that has to be in the static response therefore lives here, in the
 * server layout: the heading, the prose, and the facet links, which are the
 * only route a crawler has into the filtered views (each is otherwise reachable
 * only by submitting a form).
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo
        name="Profiles"
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        pageNode={collectionPageSchema({
          name: TITLE,
          description: DESCRIPTION,
          path: PATH,
          items: facetGroups.flatMap((group) =>
            group.links.map((link) => ({ name: link.label, path: link.href })),
          ),
        })}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
        <h1 className="font-display text-3xl text-[var(--color-text)]">{en.profiles.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)]">
          {en.profiles.subtitle}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)]">
          {en.profiles.seoIntro}
        </p>
      </div>

      {children}

      {/* Below the live results, so the interactive directory stays the first
          thing a visitor sees, but still inside the static HTML a crawler gets. */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-16 sm:px-6" aria-labelledby="directory-index">
        <h2 id="directory-index" className="font-display text-2xl text-[var(--color-text)]">
          {en.profiles.hubTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)]">
          {en.profiles.hubIntro}
        </p>

        <div className="mt-10 flex flex-col gap-10">
          {facetGroups.map((group) => (
            <div key={group.id}>
              <h3 className="font-display text-lg text-[var(--color-text)]">{group.heading}</h3>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)]">{group.body}</p>
              <nav aria-label={group.heading} className="mt-4 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary-accent)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--color-border)] pt-8">
          <h3 className="font-display text-lg text-[var(--color-text)]">{en.profiles.hubTrustTitle}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)]">
            {en.profiles.hubTrustBody}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href="/how-it-works" className="font-medium text-[var(--color-primary-accent)] hover:underline">
              {en.profiles.hubLinkHowItWorks} →
            </Link>
            <Link href="/faq" className="font-medium text-[var(--color-primary-accent)] hover:underline">
              {en.profiles.hubLinkFaq} →
            </Link>
            <Link href="/register" className="font-medium text-[var(--color-primary-accent)] hover:underline">
              {en.profiles.hubLinkRegister} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
