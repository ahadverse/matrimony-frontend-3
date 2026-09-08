import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Heart } from 'lucide-react';
import clsx from 'clsx';

/**
 * Photography behind the auth card.
 *
 * This is the landing hero's treatment, deliberately: full-height photo panels
 * under a 55% brand gradient. Arriving at /register from the home page then
 * feels like the same site rather than a plain form on a different page, and
 * the maroon/pink identity still reads while the photography shows through.
 *
 * An earlier attempt used a 7% wash with side photos above `xl`, which on any
 * normal screen amounted to no background at all.
 */
function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* One panel fills a phone; splitting the viewport there would crop both
          photos to unreadable slivers. From `sm` the pair splits left/right. */}
      <div className="absolute inset-y-0 left-0 w-full overflow-hidden sm:w-1/2">
        <Image
          src="/demo/hero-panel-left.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden sm:block">
        <Image
          src="/demo/hero-panel-right.webp"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
        />
      </div>

      {/* The brand wash. Everything above it is photography; everything the
          reader actually looks at sits on an opaque card above this. */}
      <div className="gradient-primary absolute inset-0 opacity-[0.32]" />

      {/* Darkens the edges so the card reads as lifted rather than pasted on,
          and keeps the corners from competing with the form. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}

/**
 * `wide` is for the registration wizard, whose two-column form rows do not fit
 * the login card's width. Everything else keeps the narrow default.
 *
 * `backdrop` opts a route into the photo treatment above. It is off by default:
 * login and the OAuth callback are pages someone passes through in seconds, and
 * the gradient orbs alone suit them. Registration is the long one — four steps
 * of form — so it earns the full brand moment.
 */
export function AuthShell({
  children,
  wide,
  backdrop = false,
}: {
  children: ReactNode;
  wide?: boolean;
  backdrop?: boolean;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12">
      {backdrop ? (
        <AuthBackdrop />
      ) : (
        // The plain treatment: coloured glows on the page background. These are
        // invisible over the photo backdrop, so they are swapped out rather than
        // stacked with it.
        <>
          <div
            className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/25 blur-[100px]"
            aria-hidden
          />
          <div
            className="absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-[var(--color-gold)]/20 blur-[100px]"
            aria-hidden
          />
        </>
      )}

      {/* On the photo backdrop the hearts have to be drawn in the on-primary
          ink, the way they are over the landing hero — the page-primary tint
          they use elsewhere disappears against the gradient. */}
      <Heart
        strokeWidth={1.25}
        className={clsx(
          'absolute -left-16 top-10 h-56 w-56 sm:h-72 sm:w-72',
          backdrop ? 'text-[var(--color-on-primary)]/20' : 'text-[var(--color-primary)]/15',
        )}
        aria-hidden
      />
      <Heart
        strokeWidth={1.25}
        className={clsx(
          'absolute -right-16 bottom-10 h-56 w-56 -rotate-12 sm:h-72 sm:w-72',
          backdrop ? 'text-[var(--color-on-primary)]/20' : 'text-[var(--color-primary-light)]/15',
        )}
        aria-hidden
      />

      <Link href="/" className="relative z-10 mb-8" aria-label="Biye Kora Lagbe">
        <Image src="/logo.webp" alt="Biye Kora Lagbe" width={96} height={96} priority className="h-24 w-24" />
      </Link>
      <div
        className={clsx(
          'surface-card ring-1 ring-inset ring-[var(--color-gold)]/20 relative z-10 w-full rounded-2xl p-6 sm:p-8',
          // A heavier shadow over the photo backdrop: the card has to separate
          // from a busy, mid-tone background rather than from flat page colour.
          backdrop ? 'shadow-2xl shadow-black/30' : 'shadow-xl',
          wide ? 'max-w-2xl' : 'max-w-sm',
        )}
      >
        {children}
      </div>
    </div>
  );
}
