import Link from 'next/link';
import type { ReactNode } from 'react';
import { Heart } from 'lucide-react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div
        className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-[var(--color-gold)]/20 blur-[100px]"
        aria-hidden
      />
      <Heart
        strokeWidth={1.25}
        className="absolute -left-16 top-10 h-56 w-56 text-[var(--color-primary)]/15 sm:h-72 sm:w-72"
        aria-hidden
      />
      <Heart
        strokeWidth={1.25}
        className="absolute -right-16 bottom-10 h-56 w-56 -rotate-12 text-[var(--color-primary-light)]/15 sm:h-72 sm:w-72"
        aria-hidden
      />
      <Link href="/" className="relative z-10 mb-8 font-display text-2xl gradient-text">
        Biye Kori
      </Link>
      <div className="surface-card ring-1 ring-inset ring-[var(--color-gold)]/20 relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-xl sm:p-8">
        {children}
      </div>
    </div>
  );
}
