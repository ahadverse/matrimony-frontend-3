'use client';

import Link from 'next/link';
import {
  Ban,
  BadgeCheck,
  EyeOff,
  Filter,
  Globe,
  Heart,
  HeartHandshake,
  History,
  Languages,
  Lock,
  MapPin,
  Receipt,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const sections = [
  {
    eyebrowKey: 'featuresPage.section1Eyebrow',
    titleKey: 'featuresPage.section1Title',
    bodyKey: 'featuresPage.section1Body',
    features: [
      { icon: Smartphone, titleKey: 'featuresPage.f1Title', bodyKey: 'featuresPage.f1Body' },
      { icon: UserCheck, titleKey: 'featuresPage.f2Title', bodyKey: 'featuresPage.f2Body' },
      { icon: BadgeCheck, titleKey: 'featuresPage.f3Title', bodyKey: 'featuresPage.f3Body' },
    ],
  },
  {
    eyebrowKey: 'featuresPage.section2Eyebrow',
    titleKey: 'featuresPage.section2Title',
    bodyKey: 'featuresPage.section2Body',
    features: [
      { icon: Lock, titleKey: 'featuresPage.f4Title', bodyKey: 'featuresPage.f4Body' },
      { icon: EyeOff, titleKey: 'featuresPage.f5Title', bodyKey: 'featuresPage.f5Body' },
      { icon: Ban, titleKey: 'featuresPage.f6Title', bodyKey: 'featuresPage.f6Body' },
    ],
  },
  {
    eyebrowKey: 'featuresPage.section3Eyebrow',
    titleKey: 'featuresPage.section3Title',
    bodyKey: 'featuresPage.section3Body',
    features: [
      { icon: MapPin, titleKey: 'featuresPage.f7Title', bodyKey: 'featuresPage.f7Body' },
      { icon: Globe, titleKey: 'featuresPage.f8Title', bodyKey: 'featuresPage.f8Body' },
      { icon: Filter, titleKey: 'featuresPage.f9Title', bodyKey: 'featuresPage.f9Body' },
    ],
  },
  {
    eyebrowKey: 'featuresPage.section4Eyebrow',
    titleKey: 'featuresPage.section4Title',
    bodyKey: 'featuresPage.section4Body',
    features: [
      { icon: Wallet, titleKey: 'featuresPage.f10Title', bodyKey: 'featuresPage.f10Body' },
      { icon: Receipt, titleKey: 'featuresPage.f11Title', bodyKey: 'featuresPage.f11Body' },
      { icon: History, titleKey: 'featuresPage.f12Title', bodyKey: 'featuresPage.f12Body' },
    ],
  },
  {
    eyebrowKey: 'featuresPage.section5Eyebrow',
    titleKey: 'featuresPage.section5Title',
    bodyKey: 'featuresPage.section5Body',
    features: [
      { icon: Languages, titleKey: 'featuresPage.f13Title', bodyKey: 'featuresPage.f13Body' },
      { icon: ShieldCheck, titleKey: 'featuresPage.f14Title', bodyKey: 'featuresPage.f14Body' },
      { icon: HeartHandshake, titleKey: 'featuresPage.f15Title', bodyKey: 'featuresPage.f15Body' },
    ],
  },
] as const;

export default function FeaturesPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden px-6 pt-8 pb-16">
        <div
          className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/30 blur-[100px] animate-float-glow"
          aria-hidden
        />
        <Heart strokeWidth={1.25} className="absolute -left-16 top-6 h-56 w-56 text-[var(--color-primary)]/15 sm:h-72 sm:w-72" aria-hidden />
        

        <div className="relative z-10 mx-auto mt-16 flex max-w-2xl flex-col items-center text-center">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-light)]">
              {t('featuresPage.heroEyebrow')}
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-display mt-4 text-3xl sm:text-5xl font-semibold leading-tight text-[var(--color-text)]">
              {t('featuresPage.heroTitle')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-5 text-lg text-[var(--color-text-muted)]">{t('featuresPage.heroSubtitle')}</p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="mt-4 max-w-xl text-sm text-[var(--color-text-faint)]">{t('featuresPage.leadIn')}</p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {[
                'featuresPage.trustPill1',
                'featuresPage.trustPill2',
                'featuresPage.trustPill3',
                'featuresPage.trustPill4',
                'featuresPage.trustPill5',
              ].map((key) => (
                <span
                  key={key}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]"
                >
                  {t(key)}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {sections.map((section, i) => (
        <section key={section.titleKey} className="relative overflow-hidden px-6 pb-20">
          {i === 1 && (
            <div
              className="absolute top-1/2 -right-24 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--color-gold)]/20 blur-[100px]"
              aria-hidden
            />
          )}
          {i === 3 && (
            <div
              className="absolute top-1/2 -left-24 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--color-primary)]/20 blur-[100px]"
              aria-hidden
            />
          )}
          {i === 2 && (
            <Heart
              strokeWidth={1.25}
              className="absolute -right-14 top-0 h-56 w-56 rotate-12 text-[var(--color-primary-light)]/15 sm:h-72 sm:w-72"
              aria-hidden
            />
          )}
          <div className="relative z-10 mx-auto max-w-5xl">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-light)]">
                {t(section.eyebrowKey)}
              </span>
              <h2 className="font-display mt-3 text-2xl sm:text-3xl text-[var(--color-text)]">
                {t(section.titleKey)}
              </h2>
              <p className="mt-3 text-[var(--color-text-muted)]">{t(section.bodyKey)}</p>
            </FadeIn>

            <StaggerList className="mt-10 grid gap-6 sm:grid-cols-3">
              {section.features.map(({ icon: Icon, titleKey, bodyKey }) => (
                <StaggerItem key={titleKey}>
                  <Card className="h-full p-6">
                    <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-on-primary)] glow-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display mt-4 text-lg text-[var(--color-text)]">{t(titleKey)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{t(bodyKey)}</p>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerList>

            {i < sections.length - 1 && <div className="mx-auto mt-16 h-px max-w-5xl bg-[var(--color-border)]" />}
          </div>
        </section>
      ))}

      <section className="px-6 pb-24">
        <FadeIn className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] px-8 py-16 text-center">
            <div
              className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/30 blur-[100px]"
              aria-hidden
            />
            <Heart strokeWidth={1.25} className="absolute -right-10 -bottom-10 h-48 w-48 text-[var(--color-primary-accent)]/15" aria-hidden />
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="font-display text-3xl sm:text-4xl text-[var(--color-text)]">
                {t('featuresPage.ctaTitle')}
              </h2>
              <p className="mt-4 max-w-lg text-[var(--color-text-muted)]">{t('featuresPage.ctaBody')}</p>
              <Link href="/register" className="mt-8">
                <Button size="lg">{t('featuresPage.ctaButton')}</Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      
    </div>
  );
}
