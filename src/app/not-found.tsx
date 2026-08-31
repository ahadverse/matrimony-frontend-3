import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Heart, LifeBuoy, Sparkles, UserPlus } from 'lucide-react';
import { privateRouteMetadata } from '@/lib/seo/metadata';

/**
 * Next's built-in 404 is an unstyled "This page could not be found" with no way
 * out of it. That is a dead end for a visitor and a dead end for a crawler,
 * which arrives here from every stale link and old URL and finds nothing to
 * follow. This replaces it with the site's own chrome and, more importantly,
 * with links back into the pages we actually want crawled.
 *
 * The route still answers 410-equivalent `noindex` — Next serves a real HTTP 404
 * status here, so the page must never claim to be indexable content.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  // Overrides the site-wide description, which would otherwise describe the
  // product on a page that is an error.
  description: 'The page you were looking for does not exist or has been moved.',
  ...privateRouteMetadata,
};

const destinations = [
  {
    href: '/profiles',
    icon: Compass,
    title: 'Browse profiles',
    body: 'Verified brides and grooms from around the world.',
  },
  {
    href: '/how-it-works',
    icon: Sparkles,
    title: 'How it works',
    body: 'The five steps from registering to a proposal your families can act on.',
  },
  {
    href: '/register',
    icon: UserPlus,
    title: 'Create a free profile',
    body: 'Phone verification, a team review, and you are live in about 24 hours.',
  },
  {
    href: '/contact-us',
    icon: LifeBuoy,
    title: 'Contact our team',
    body: 'Reach us by phone, WhatsApp or email if you were looking for something else.',
  },
] as const;

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-20">
      <Heart
        strokeWidth={1.25}
        className="pointer-events-none absolute -left-16 top-10 h-56 w-56 -rotate-12 text-[var(--color-primary)]/10"
        aria-hidden
      />
      <Heart
        strokeWidth={1.25}
        className="pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rotate-12 text-[var(--color-primary-light)]/10"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
          Error 404
        </span>
        <h1 className="font-display mt-3 text-3xl leading-tight text-[var(--color-text)] sm:text-4xl">
          We could not find that page
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-[var(--color-text-muted)]">
          The link may be out of date, or the profile it pointed to may have been hidden or removed by its owner.
          Everything else is exactly where you left it.
        </p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          {destinations.map(({ href, icon: Icon, title, body }) => (
            <Link
              key={href}
              href={href}
              className="surface-card flex items-start gap-4 rounded-2xl p-5 transition-colors hover:border-[var(--color-primary)]"
            >
              <span className="gradient-primary glow-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-on-primary)]">
                <Icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="font-display block text-base text-[var(--color-text)]">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[var(--color-text-muted)]">{body}</span>
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-10 inline-block text-sm font-medium text-[var(--color-primary-accent)] hover:underline"
        >
          Back to the home page →
        </Link>
      </div>
    </div>
  );
}
