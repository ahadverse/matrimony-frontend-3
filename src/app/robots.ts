import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/seo/site';

/**
 * The signed-in app, auth callbacks and checkout are all disallowed: they are
 * behind a session, so a crawler only ever reaches a login redirect there, and
 * every request it spends on them is crawl budget taken from the marketing
 * pages we actually want indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/browse',
          '/interests',
          '/inbox',
          '/edit-profile',
          '/verify-selfie',
          '/checkout',
          '/profile/',
          '/callback',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
