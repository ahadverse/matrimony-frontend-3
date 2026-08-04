import type { ReactNode } from 'react';

type Tone = 'like' | 'nope' | 'super';

// Filled pills rather than outlined text: gold outlined on a photo is only
// ~2.3:1 contrast and fails even large-text, and filled tones read reliably
// regardless of what's underneath.
const toneClasses: Record<Tone, string> = {
  like: 'bg-[var(--color-success)] text-[var(--color-on-primary)]',
  nope: 'bg-[var(--color-pass)] text-[var(--color-on-primary)]',
  super: 'bg-[var(--color-gold)] text-[var(--color-on-gold)]',
};

export function SwipeStamp({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`rounded-lg px-4 py-1.5 text-xl font-bold drop-shadow-lg ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
