import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from './site';

/**
 * Google renders roughly 580px of title and 920px of description before it cuts
 * to an ellipsis, which works out at about these counts for Latin text. Going
 * over does not hurt ranking, but the tail is what gets dropped — so a title
 * that runs long loses its brand, and a description that runs long loses its
 * call to action. The root layout appends " | Biye Kora Lagbe" (18 chars) to
 * every child title, so a route's own title has 42 characters to work with.
 * The suffix length is measured from SITE_NAME rather than written down, so a
 * rename moves the budget with it — as the last one did, from 16 to 18.
 */
const TITLE_SUFFIX_LENGTH = ` | ${SITE_NAME}`.length;
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

/**
 * Shouts during `next build` when a route overruns, so the limits above are
 * enforced at the moment copy is written rather than discovered months later in
 * a Search Console export. Deliberately a warning, not a throw — a long title
 * is a quality problem, not a broken build.
 */
function warnIfTruncated(path: string, title: string, description: string, appendsBrand: boolean) {
  // Server-side only. These modules are evaluated during `next build`, which is
  // where the warning is actually useful — gating on NODE_ENV would silence it
  // there, since a build always runs as production.
  if (typeof window !== 'undefined') return;

  const titleLength = title.length + (appendsBrand ? TITLE_SUFFIX_LENGTH : 0);
  if (titleLength > MAX_TITLE) {
    console.warn(`[seo] ${path}: title is ${titleLength} chars (max ${MAX_TITLE}) — Google will truncate it.`);
  }
  if (description.length > MAX_DESCRIPTION) {
    console.warn(
      `[seo] ${path}: description is ${description.length} chars (max ${MAX_DESCRIPTION}) — the tail will be cut.`,
    );
  }
}

/**
 * Next merges metadata *shallowly*: a route that defines its own `openGraph`
 * replaces the parent's whole object, which drops the og:image that
 * `app/opengraph-image.tsx` injects at the root. So every route that sets
 * openGraph must restate the image, and this is the one place it is described.
 */
export const OG_IMAGE = {
  url: absoluteUrl('/opengraph-image'),
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
} as const;

interface PageMetaInput {
  title: string;
  description: string;
  /** Route path, e.g. `/faq`. Used for the canonical and the og:url. */
  path: string;
  keywords?: string[];
  /** Set for utility routes that must never appear in search results. */
  noindex?: boolean;
  /**
   * True when the title already contains the brand and opts out of the root
   * layout's `%s | Biye Kora Lagbe` template — only the home page does this.
   */
  absoluteTitle?: boolean;
}

/**
 * Builds a complete per-route metadata object. Every marketing route gets a
 * self-referencing canonical — without one, the same page reachable through
 * tracking params (`?fbclid=…`, `?utm_source=…`) is indexed as several
 * duplicates and the ranking signals split between them.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noindex,
  absoluteTitle,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  // A noindex route never reaches a SERP, so its title length is irrelevant.
  if (!noindex) warnIfTruncated(path, title, description, !absoluteTitle);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: 'bn_BD',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
    ...(noindex
      ? { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
      : {}),
  };
}

/**
 * Metadata for the signed-in application shell. These routes are behind auth,
 * render per-user data and have no search value — crawling them only wastes
 * crawl budget on pages that resolve to a login redirect.
 */
export const privateRouteMetadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const SITE_METADATA_BASE = new URL(SITE_URL);
export const DEFAULT_DESCRIPTION = SITE_DESCRIPTION;
