import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/site';

/**
 * Only publicly reachable, indexable routes belong here — listing a page that
 * robots.txt disallows, or that carries a noindex tag, is a Search Console
 * error rather than a hint.
 *
 * The filtered directory views (`/profiles?state=Dhaka` and the rest) are
 * deliberately absent. They all canonicalise to `/profiles`, so listing them
 * would be submitting URLs we have already told Google not to index. They are
 * discoverable through the links on /profiles itself, which is what a sitemap
 * cannot replace anyway.
 *
 * `priority` is relative within this one sitemap: it tells a crawler which of
 * our pages matter most, not how we rank against anyone else.
 */
const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/profiles', changeFrequency: 'daily', priority: 0.9 },
  { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/features', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/success-stories', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/assistance-service', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
  // Dropped from 0.9. It is a form with almost no readable content, so ranking
  // it alongside the directory only invited a thin-content assessment; it stays
  // indexable because people do search the brand plus "registration".
  { path: '/register', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact-us', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
