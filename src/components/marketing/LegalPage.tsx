'use client';

import { Heart } from 'lucide-react';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * Shared frame for the Terms and Privacy pages — both are the same shape
 * (title, intro, then numbered sections), so only their key prefix differs.
 * Content lives in the message files, which keeps these pages translated
 * rather than English-only markup with a Bangla copy bolted on beside it.
 */
export function LegalPage({
  titleKey,
  updatedKey,
  introKey,
  sectionKeys,
  updated,
}: {
  titleKey: string;
  updatedKey: string;
  introKey: string;
  sectionKeys: readonly string[];
  updated: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden px-6 py-12">
      <Heart
        strokeWidth={1.25}
        className="absolute -right-16 top-10 h-56 w-56 -rotate-12 text-[var(--color-primary)]/10"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="font-display text-3xl text-[var(--color-text)] sm:text-4xl">{t(titleKey)}</h1>
          <p className="mt-2 text-xs text-[var(--color-text-faint)]">{t(updatedKey, { date: updated })}</p>
          <p className="mt-5 text-base leading-relaxed text-[var(--color-text-muted)]">{t(introKey)}</p>
          <hr className="rule-gold mt-8" />
        </FadeIn>

        <StaggerList className="mt-8 flex flex-col gap-8">
          {sectionKeys.map((key) => (
            <StaggerItem key={key}>
              <section>
                <h2 className="font-display text-lg text-[var(--color-text)]">{t(`${key}Title`)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{t(`${key}Body`)}</p>
              </section>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </div>
  );
}
