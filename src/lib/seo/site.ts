/**
 * Single source of truth for everything the SEO layer needs to name the site:
 * metadata, robots.txt, sitemap.xml and the JSON-LD graph all read from here,
 * so the canonical host is defined once and never drifts between them.
 */

// Absolute URLs are required by Open Graph, canonicals and the sitemap, so this
// must be the real production origin — a relative fallback would silently
// produce unusable tags. NEXT_PUBLIC_SITE_URL lets a staging deploy override it.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://biyekoralagbe.com').replace(/\/$/, '');

export const SITE_NAME = 'Biye Kora Lagbe';
export const SITE_LEGAL_NAME = 'Biye Kora Lagbe';

export const SITE_TAGLINE = 'Verified Matrimony Worldwide';

export const SITE_DESCRIPTION =
  'Biye Kora Lagbe is a phone-verified matrimony platform for families worldwide. Browse reviewed bride and groom profiles, filter by country, religion, education and profession, and connect privately — with your family involved at every step.';

export const CONTACT_PHONE = '+880 1304 082381';
export const CONTACT_EMAIL = 'biyekoralagbe@gmail.com';

export const CONTACT_ADDRESS = {
  street: 'Mujib Road, Community Hospital Bhabon, 4th floor',
  locality: 'Sirajganj',
  region: 'Rajshahi Division',
  country: 'BD',
} as const;

/**
 * Official profiles, in the order they should appear. These feed three things at
 * once: the icon rows in the site footer and on /contact-us, and the
 * Organization schema's `sameAs`, which is how Google ties this site to the
 * accounts it already knows about.
 *
 * An entry left blank is skipped everywhere — deliberately, because a link to a
 * network's bare homepage is worse than no link at all, and a `sameAs` pointing
 * at facebook.com rather than at our own page is an unverifiable claim that
 * Google simply discards. Retiring a profile therefore means blanking its url,
 * not deleting the icon row that renders it.
 *
 * YouTube is the one URL that cannot be built from the handle by analogy with
 * the others: a channel is reachable at /@handle, never at a bare /handle.
 */
export const SOCIAL_LINKS: { label: string; url: string }[] = [
  { label: 'Facebook', url: 'https://www.facebook.com/biyekoralagbe' },
  { label: 'YouTube', url: 'https://www.youtube.com/@biyekoralagbe' },
  { label: 'Instagram', url: 'https://www.instagram.com/biyekoralagbe' },
  { label: 'X', url: 'https://x.com/biyekoralagbe' },
];

/** Only the profiles that have actually been filled in. */
export const ACTIVE_SOCIAL_LINKS = SOCIAL_LINKS.filter((link) => link.url.trim() !== '');

/**
 * Search Console's HTML-tag verification method. Set GOOGLE_SITE_VERIFICATION
 * in the deploy environment to the `content` value Google hands you — it is a
 * public token, not a secret, but it belongs in env rather than in the repo so
 * staging and production can verify separately.
 */
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '';

/** Keyword set used as the default `keywords` meta for the marketing routes. */
export const SITE_KEYWORDS = [
  'matrimony site',
  'matrimonial site',
  'biye',
  'bride and groom search',
  'verified matrimony profiles',
  'Muslim matrimony',
  'international matrimony',
  'marriage media',
  'patro patri',
  'online biye',
];

/** Absolute URL helper — `path` is a route like `/faq` or the bare origin. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}
