import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/seo/site';

/**
 * The web app manifest. Most of the traffic here is mobile, and without this
 * Android offers no "add to home screen" prompt and Chrome's installability
 * audit fails — one of the handful of Lighthouse checks that is pass/fail
 * rather than a score.
 *
 * `start_url` carries a UTM source so installs are separable from ordinary
 * mobile visits in Analytics; without it every session from an installed icon
 * is indistinguishable from a direct one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'bn',
    dir: 'ltr',
    categories: ['social', 'lifestyle'],
    background_color: '#ffffff',
    // Matches the maroon in the brand gradient, so the splash screen and the
    // Android task-switcher chrome read as ours rather than as default white.
    theme_color: '#7a1338',
    icons: [
      { src: '/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },
      { src: '/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },
      { src: '/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Browse profiles', url: '/profiles' },
      { name: 'Create a profile', url: '/register' },
    ],
  };
}
