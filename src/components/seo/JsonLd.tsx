import {
  ACTIVE_SOCIAL_LINKS,
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_DESCRIPTION,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from '@/lib/seo/site';

/**
 * Renders a schema.org graph as JSON-LD. Google reads `application/ld+json`
 * from the served HTML, so this stays a server component — nothing here may
 * depend on hydration.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own constants, never from user input, so
      // there is no injected-markup path here. JSON.stringify still escapes the
      // one character that could close the tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Publisher identity — reused by every other node through `@id`. */
export const organizationSchema = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: {
    '@type': 'ImageObject',
    // Google wants at least 112×112 for the logo it may show beside a brand
    // result; this is the 512px square, and WebP is an accepted format. The
    // 500×500 logo.png it replaced was 254KB for the same picture.
    url: absoluteUrl('/icon-512.webp'),
    width: 512,
    height: 512,
    caption: SITE_NAME,
  },
  // The service is worldwide; the registered office happens to be in Bangladesh
  // (see `address` below), which is a different claim and stays accurate.
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      availableLanguage: ['English', 'Bengali'],
    },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT_ADDRESS.street,
    addressLocality: CONTACT_ADDRESS.locality,
    addressRegion: CONTACT_ADDRESS.region,
    addressCountry: CONTACT_ADDRESS.country,
  },
  // How Google links this site to the social accounts it already indexes, which
  // is what lets the two be shown as one entity in a knowledge panel. Omitted
  // entirely while no profile URLs are configured — an empty array, or one
  // pointing at facebook.com rather than at our own page, is simply discarded.
  ...(ACTIVE_SOCIAL_LINKS.length ? { sameAs: ACTIVE_SOCIAL_LINKS.map((link) => link.url) } : {}),
};

/** Site node, with the search action that enables a sitelinks search box. */
export const websiteSchema = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: 'bn',
  publisher: { '@id': ORGANIZATION_ID },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/profiles?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/** The site-wide graph, rendered once in the root layout. */
export const siteGraph = {
  '@context': 'https://schema.org',
  '@graph': [organizationSchema, websiteSchema],
};

/**
 * Breadcrumbs give search results a readable path instead of a raw URL. `trail`
 * excludes Home, which is prepended here so every page's trail starts the same.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** FAQ rich result. Answers must be the same text the page shows the visitor. */
export function faqSchema(entries: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/**
 * A paid service with its price list. `price` must be a bare number and
 * `priceCurrency` an ISO code — a "৳20,000" string here is invalid and the
 * offer is dropped, so callers pass the numeric amount separately from the
 * formatted label the page displays.
 */
export function serviceSchema({
  name,
  description,
  path,
  offers,
}: {
  name: string;
  description: string;
  path: string;
  offers: { name: string; price: number }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl(path)}#service`,
    name,
    description,
    serviceType: 'Matchmaking',
    provider: { '@id': ORGANIZATION_ID },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    url: absoluteUrl(path),
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: 'BDT',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(path),
    })),
  };
}

/**
 * The directory page. `CollectionPage` tells Google this URL is an index over
 * other things rather than an article, and the `ItemList` names the facets we
 * link to — the same links the page renders, so the two agree.
 */
export function collectionPageSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: 'bn',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

/**
 * The contact page, with the same phone, email and address the page prints.
 * Google reads this for the contact details it shows beside a brand result.
 */
export function contactPageSchema({ name, description, path }: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: 'bn',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: {
      '@id': ORGANIZATION_ID,
      '@type': 'Organization',
      name: SITE_NAME,
      telephone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT_ADDRESS.street,
        addressLocality: CONTACT_ADDRESS.locality,
        addressRegion: CONTACT_ADDRESS.region,
        addressCountry: CONTACT_ADDRESS.country,
      },
    },
  };
}

/** Describes a single marketing page and ties it back to the publisher. */
export function webPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: 'bn',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}
