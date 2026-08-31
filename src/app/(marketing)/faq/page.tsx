'use client';

import Link from 'next/link';
import { ChevronDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { faqCategoryKeys } from '@/lib/faqCategories';

const categories = faqCategoryKeys();

export default function FaqPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden px-6 pt-8 pb-16">
        <div
          className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-primary-dark)]/20 blur-[100px] animate-float-glow"
          aria-hidden
        />
        <Heart strokeWidth={1.25} className="absolute -right-16 top-6 h-56 w-56 rotate-12 text-[var(--color-primary)]/15 sm:h-72 sm:w-72" aria-hidden />
        

        <div className="relative z-10 mx-auto mt-16 flex max-w-2xl flex-col items-center text-center">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-light)]">
              {t('faqPage.heroEyebrow')}
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-display mt-4 text-3xl sm:text-5xl font-semibold leading-tight text-[var(--color-text)]">
              {t('faqPage.heroTitle')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-5 text-lg text-[var(--color-text-muted)]">{t('faqPage.heroSubtitle')}</p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <p className="mt-4 max-w-xl text-sm text-[var(--color-text-faint)]">{t('faqPage.leadIn')}</p>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 pb-24">
        <div
          className="absolute top-1/4 -right-24 h-72 w-72 rounded-full bg-[var(--color-gold)]/20 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute bottom-1/4 -left-24 h-72 w-72 rounded-full bg-[var(--color-primary-dark)]/15 blur-[100px]"
          aria-hidden
        />
        <Heart strokeWidth={1.25} className="absolute -right-14 bottom-10 h-56 w-56 -rotate-12 text-[var(--color-primary-light)]/15 sm:h-72 sm:w-72" aria-hidden />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-14">
          {categories.map((category) => (
            <div key={category.titleKey}>
              <FadeIn>
                <h2 className="font-display text-xl text-[var(--color-text)]">{t(category.titleKey)}</h2>
              </FadeIn>
              <StaggerList className="mt-5 flex flex-col gap-3">
                {category.items.map((faq) => (
                  <StaggerItem key={faq.qKey}>
                    <details className="group surface-card rounded-2xl px-6 py-1">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                        <span className="font-display text-base text-[var(--color-text)]">{t(faq.qKey)}</span>
                        <ChevronDown
                          size={18}
                          className="shrink-0 text-[var(--color-text-faint)] transition-transform duration-300 group-open:rotate-180"
                        />
                      </summary>
                      <p className="pb-5 text-sm leading-relaxed text-[var(--color-text-muted)]">{t(faq.aKey)}</p>
                    </details>
                  </StaggerItem>
                ))}
              </StaggerList>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <FadeIn className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] px-8 py-16 text-center">
            <div
              className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/30 blur-[100px]"
              aria-hidden
            />
            <Heart strokeWidth={1.25} className="absolute -right-10 -bottom-10 h-48 w-48 text-[var(--color-primary-accent)]/15" aria-hidden />
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="font-display text-3xl sm:text-4xl text-[var(--color-text)]">{t('faqPage.ctaTitle')}</h2>
              <p className="mt-4 max-w-lg text-[var(--color-text-muted)]">{t('faqPage.ctaBody')}</p>
              <Link href="/register" className="mt-8">
                <Button size="lg">{t('faqPage.ctaButton')}</Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      
    </div>
  );
}
