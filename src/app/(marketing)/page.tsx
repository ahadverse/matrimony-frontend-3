'use client';

import Link from 'next/link';
import clsx from 'clsx';
import {
  CheckCircle2,
  ChevronDown,
  Globe2,
  Heart,
  HeartHandshake,
  Languages,
  Lock,
  MapPin,
  MessageCircleHeart,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { usePublicStats } from '@/lib/queries';
import type { PublicStats } from '@/lib/types';

const steps = [
  { icon: UserCheck, titleKey: 'landing.step1Title', bodyKey: 'landing.step1Body' },
  { icon: Sparkles, titleKey: 'landing.step2Title', bodyKey: 'landing.step2Body' },
  { icon: Heart, titleKey: 'landing.step3Title', bodyKey: 'landing.step3Body' },
] as const;

const stats = [
  { valueKey: 'landing.stat1Value', labelKey: 'landing.stat1Label', statField: 'statVerifiedMembers' },
  { valueKey: 'landing.stat2Value', labelKey: 'landing.stat2Label', statField: 'statMatchesMade' },
  { valueKey: 'landing.stat3Value', labelKey: 'landing.stat3Label', statField: 'statDistrictsCovered' },
  { valueKey: 'landing.stat4Value', labelKey: 'landing.stat4Label', statField: 'statAverageRating' },
] as const satisfies { valueKey: string; labelKey: string; statField: keyof PublicStats }[];

const personas = [
  { icon: UserCheck, titleKey: 'landing.persona1Title', bodyKey: 'landing.persona1Body' },
  { icon: Users, titleKey: 'landing.persona2Title', bodyKey: 'landing.persona2Body' },
  { icon: HeartHandshake, titleKey: 'landing.persona3Title', bodyKey: 'landing.persona3Body' },
  { icon: Globe2, titleKey: 'landing.persona4Title', bodyKey: 'landing.persona4Body' },
] as const;

const bfbTiles = [
  { icon: ShieldCheck, titleKey: 'landing.bfb1Title', bodyKey: 'landing.bfb1Body' },
  { icon: Phone, titleKey: 'landing.bfb2Title', bodyKey: 'landing.bfb2Body' },
  { icon: Lock, titleKey: 'landing.bfb3Title', bodyKey: 'landing.bfb3Body' },
  { icon: Sparkles, titleKey: 'landing.bfb5Title', bodyKey: 'landing.bfb5Body' },
  { icon: MessageCircleHeart, titleKey: 'landing.bfb6Title', bodyKey: 'landing.bfb6Body' },
] as const;

const features = [
  { icon: ShieldCheck, titleKey: 'landing.feature1Title', bodyKey: 'landing.feature1Body' },
  { icon: Lock, titleKey: 'landing.feature2Title', bodyKey: 'landing.feature2Body' },
  { icon: MapPin, titleKey: 'landing.feature3Title', bodyKey: 'landing.feature3Body' },
  { icon: Wallet, titleKey: 'landing.feature4Title', bodyKey: 'landing.feature4Body' },
  { icon: Languages, titleKey: 'landing.feature5Title', bodyKey: 'landing.feature5Body' },
  { icon: HeartHandshake, titleKey: 'landing.feature6Title', bodyKey: 'landing.feature6Body' },
] as const;

const stories = [
  { quoteKey: 'landing.story1Quote', nameKey: 'landing.story1Name', metaKey: 'landing.story1Meta' },
  { quoteKey: 'landing.story2Quote', nameKey: 'landing.story2Name', metaKey: 'landing.story2Meta' },
  { quoteKey: 'landing.story3Quote', nameKey: 'landing.story3Name', metaKey: 'landing.story3Meta' },
] as const;

const safetyPoints = [
  'landing.safetyPoint1',
  'landing.safetyPoint2',
  'landing.safetyPoint3',
  'landing.safetyPoint4',
] as const;

const faqs = [
  { qKey: 'landing.faq1Q', aKey: 'landing.faq1A' },
  { qKey: 'landing.faq2Q', aKey: 'landing.faq2A' },
  { qKey: 'landing.faq3Q', aKey: 'landing.faq3A' },
  { qKey: 'landing.faq4Q', aKey: 'landing.faq4A' },
  { qKey: 'landing.faq5Q', aKey: 'landing.faq5A' },
] as const;

export default function LandingPage() {
  const { t } = useLanguage();
  const { data: publicStats } = usePublicStats();

  return (
    <div className="flex-1">
      {/* Hero — text-only, centered. maroon/pink gradient panel since it's a
          fixed brand moment, not UI chrome. */}
      <section className="gradient-primary relative overflow-hidden">
        <Heart
          strokeWidth={1.25}
          className="absolute -left-12 -top-10 h-40 w-40 text-[var(--color-on-primary)]/15 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
          aria-hidden
        />
        <Heart
          strokeWidth={1.25}
          className="absolute -right-12 -bottom-10 h-40 w-40 rotate-12 text-[var(--color-on-primary)]/15 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center text-[var(--color-on-primary)] lg:py-24">
          <FadeIn delay={0.1}>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{t('landing.title')}</h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-5 max-w-lg text-[var(--color-on-primary)]/85">{t('landing.subtitle')}</p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/browse">
                <Button size="lg" className="!bg-white !bg-none !text-[var(--color-primary-accent)]">
                  {t('landing.ctaPrimary')}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="!border-[var(--color-on-primary)]/50 !text-[var(--color-on-primary)]">
                  {t('landing.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-[var(--color-on-primary)]/70">
              <ShieldCheck size={14} />
              {t('landing.trustBadge')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Quick-join teaser — sample block 2 */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)] px-6 py-14">
        <Heart
          strokeWidth={1.25}
          className="absolute -right-10 -top-10 h-32 w-32 rotate-12 text-[var(--color-primary)]/10"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
              {t('landing.quickJoinEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl text-[var(--color-text)] sm:text-3xl">
              {t('landing.quickJoinTitle')}
            </h2>
            <p className="mt-4 text-[var(--color-text-muted)]">{t('landing.quickJoinBody')}</p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {['quickJoinPoint1', 'quickJoinPoint2', 'quickJoinPoint3'].map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                  {t(`landing.${key}`)}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="mx-auto w-full max-w-sm p-6 text-center">
              <p className="font-display text-lg text-[var(--color-text)]">{t('landing.quickJoinCardTitle')}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('landing.quickJoinCardSubtitle')}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/register"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] p-4 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
                >
                  <span className="text-2xl">👰</span>
                  {t('landing.quickJoinBride')}
                </Link>
                <Link
                  href="/register"
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] p-4 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
                >
                  <span className="text-2xl">🤵</span>
                  {t('landing.quickJoinGroom')}
                </Link>
              </div>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Registration counters */}
      <FadeIn className="border-b border-[var(--color-border)] px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
          {[
            { value: publicStats?.statVerifiedMembers ?? '2,271', labelKey: 'landing.counterWomen' },
            { value: '3,099', labelKey: 'landing.counterMen' },
            { value: publicStats?.statMatchesMade ?? '5,370', labelKey: 'landing.counterTotal' },
          ].map((c) => (
            <div key={c.labelKey}>
              <div className="font-display text-2xl text-[var(--color-primary-accent)]">{c.value}</div>
              <div className="mt-1 text-xs text-[var(--color-text-faint)]">{t(c.labelKey)}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Personas — sample block 3 */}
      <section className="relative overflow-hidden px-6 py-20">
        <Heart
          strokeWidth={1.25}
          className="absolute -left-14 bottom-0 h-44 w-44 -rotate-12 text-[var(--color-primary)]/10"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl">
          <FadeIn className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
              {t('landing.personasEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl text-[var(--color-text)] sm:text-3xl">
              {t('landing.personasTitle')}
              <br />
              <span className="text-[var(--color-primary-accent)]">{t('landing.personasHighlight')}</span>
            </h2>
          </FadeIn>

          {/* Divided row list — deliberately not another icon-card grid. */}
          <StaggerList className="mt-12 flex flex-col divide-y divide-[var(--color-border)]">
            {personas.map(({ icon: Icon, titleKey, bodyKey }) => (
              <StaggerItem key={titleKey}>
                <div className="flex items-start gap-5 py-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]">
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg text-[var(--color-text)]">{t(titleKey)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{t(bodyKey)}</p>
                  </div>
                  <Link
                    href="/register"
                    className="hidden shrink-0 self-center text-xs font-semibold text-[var(--color-primary-accent)] hover:underline sm:block"
                  >
                    {t('landing.personaGetStarted')} →
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Built for Bangladesh tiles — sample block 4 (named features, static/coming-soon per scope) */}
      <section className="bg-[var(--color-surface)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
              {t('landing.bfbEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl text-[var(--color-text)] sm:text-3xl">
              {t('landing.bfbTitle')} <span className="text-[var(--color-primary-accent)]">{t('landing.bfbHighlight')}</span>
            </h2>
          </FadeIn>

          {/* Bento layout — first tile featured/large instead of a uniform grid. */}
          <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bfbTiles.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <StaggerItem key={titleKey} className={i === 0 ? 'sm:col-span-2' : ''}>
                {i === 0 ? (
                  <Card className="gradient-primary glow-primary flex h-full flex-col justify-center gap-5 p-8 text-[var(--color-on-primary)] sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-on-primary)]/15">
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl">{t(titleKey)}</h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-on-primary)]/85">{t(bodyKey)}</p>
                    </div>
                  </Card>
                ) : (
                  <Card className="h-full p-6">
                    <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-on-primary)] glow-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display mt-4 text-lg text-[var(--color-text)]">{t(titleKey)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{t(bodyKey)}</p>
                    <span className="mt-3 inline-block text-xs font-semibold text-[var(--color-text-faint)]">
                      {t('landing.bfbLearnMore')} →
                    </span>
                  </Card>
                )}
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden px-6 py-20 scroll-mt-20">
        <Heart
          strokeWidth={1.25}
          className="absolute -right-12 top-4 h-36 w-36 rotate-6 text-[var(--color-primary)]/10"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl">
          <FadeIn className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
              {t('landing.featuresEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl text-[var(--color-text)] sm:text-3xl">
              {t('landing.featuresTitle')}
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">{t('landing.featuresSubtitle')}</p>
          </FadeIn>

          <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, titleKey, bodyKey }) => (
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

          <FadeIn className="mt-10 flex justify-center">
            <Link href="/features" className="text-sm font-medium text-[var(--color-primary-accent)] hover:underline">
              {t('landing.featuresSeeAll')} →
            </Link>
          </FadeIn>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-[var(--color-surface)] px-6 py-20 scroll-mt-20">
        <Heart
          strokeWidth={1.25}
          className="absolute -left-10 bottom-2 h-32 w-32 rotate-12 text-[var(--color-primary)]/10"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl">
          <FadeIn className="flex flex-col items-center text-center">
            <h2 className="font-display text-2xl text-[var(--color-text)] sm:text-3xl">{t('landing.howItWorksTitle')}</h2>
            <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">{t('landing.howItWorksSubtitle')}</p>
          </FadeIn>

          {/* Connected stepper — no cards, a horizontal timeline instead. */}
          <StaggerList className="relative mt-14 grid gap-10 sm:grid-cols-3">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-[var(--color-border)] sm:block" aria-hidden />
            {steps.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <StaggerItem key={titleKey} className="relative flex flex-col items-center text-center">
                <div
                  className={clsx(
                    'relative z-10 flex h-12 w-12 items-center justify-center rounded-full',
                    i % 2 === 0
                      ? 'gradient-primary text-[var(--color-on-primary)] glow-primary'
                      : 'gradient-gold text-[var(--color-on-gold)] glow-gold',
                  )}
                >
                  <Icon size={20} />
                </div>
                <div className="mt-5 text-xs font-semibold text-[var(--color-primary-accent)]">
                  {t('landing.howItWorksStep')} 0{i + 1}
                </div>
                <h3 className="font-display mt-1 text-lg text-[var(--color-text)]">{t(titleKey)}</h3>
                <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-[var(--color-text-muted)]">{t(bodyKey)}</p>
              </StaggerItem>
            ))}
          </StaggerList>

          <FadeIn className="mt-10 flex justify-center">
            <Link href="/how-it-works" className="text-sm font-medium text-[var(--color-primary-accent)] hover:underline">
              {t('landing.howItWorksSeeAll')} →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Success stories teaser — stays a dark band per samples, in both themes */}
      <section id="stories" className="inverse-band px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-5xl">
          <FadeIn className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-light)]">
              {t('landing.storiesEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl sm:text-3xl">{t('landing.storiesTitle')}</h2>
            <p className="inverse-muted mt-3 max-w-xl">{t('landing.storiesSubtitle')}</p>
          </FadeIn>

          <StaggerList className="mt-12 grid gap-6 sm:grid-cols-3">
            {stories.map((story) => (
              <StaggerItem key={story.nameKey}>
                <Card className="h-full p-6">
                  <Quote size={22} className="text-[var(--color-primary-light)]" />
                  <p className="inverse-muted mt-4 text-sm leading-relaxed italic">&ldquo;{t(story.quoteKey)}&rdquo;</p>
                  <div className="mt-5 border-t border-[var(--color-inverse-border)] pt-4">
                    <div className="font-display text-sm">{t(story.nameKey)}</div>
                    <div className="inverse-muted text-xs">{t(story.metaKey)}</div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>

          <FadeIn className="mt-10 flex justify-center">
            <Link href="/success-stories" className="text-sm font-medium text-[var(--color-primary-light)] hover:underline">
              {t('landing.storiesSeeAll')} →
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-20">
        <Heart
          strokeWidth={1.25}
          className="absolute -right-14 -bottom-6 h-40 w-40 -rotate-6 text-[var(--color-primary)]/10"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
              {t('landing.safetyEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl text-[var(--color-text)] sm:text-3xl">{t('landing.safetyTitle')}</h2>
            <p className="mt-4 text-[var(--color-text-muted)]">{t('landing.safetyBody')}</p>

            <ul className="mt-6 flex flex-col gap-3">
              {safetyPoints.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                  <span className="text-sm text-[var(--color-text-muted)]">{t(key)}</span>
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <div className="gradient-primary flex h-16 w-16 items-center justify-center rounded-2xl text-[var(--color-on-primary)] glow-primary">
                <ShieldCheck size={28} />
              </div>
              <div className="font-display gradient-text mt-6 text-4xl">
                {publicStats?.statProfilesReviewedPercent ?? t('landing.safetyStatValue')}
              </div>
              <p className="mt-2 max-w-[16rem] text-sm text-[var(--color-text-muted)]">{t('landing.safetyStatLabel')}</p>
            </Card>
          </FadeIn>
        </div>
      </section>

      <FadeIn className="border-y border-[var(--color-border)] px-6 py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 text-center sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.valueKey} className="flex flex-col items-center">
              <span className="font-display gradient-text text-2xl sm:text-3xl">
                {publicStats?.[stat.statField] ?? t(stat.valueKey)}
              </span>
              <span className="mt-1 text-xs text-[var(--color-text-faint)]">{t(stat.labelKey)}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      <section id="faq" className="px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <FadeIn className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
              {t('landing.faqEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl text-[var(--color-text)] sm:text-3xl">{t('landing.faqTitle')}</h2>
            <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">{t('landing.faqSubtitle')}</p>
          </FadeIn>

          <StaggerList className="mt-10 flex flex-col gap-3">
            {faqs.map((faq) => (
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

          <FadeIn className="mt-8 flex justify-center">
            <Link href="/faq" className="text-sm font-medium text-[var(--color-primary-accent)] hover:underline">
              {t('landing.faqSeeAll')} →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA band — stays maroon/pink regardless of theme, matches sample */}
      <section className="gradient-primary relative overflow-hidden px-6 py-20 text-center text-[var(--color-on-primary)]">
        <Heart
          strokeWidth={1.25}
          className="absolute -left-10 -bottom-12 h-36 w-36 -rotate-12 text-[var(--color-on-primary)]/15 sm:h-52 sm:w-52 lg:h-64 lg:w-64"
          aria-hidden
        />
        <Heart
          strokeWidth={1.25}
          className="absolute -right-10 -top-12 h-36 w-36 rotate-12 text-[var(--color-on-primary)]/15 sm:h-52 sm:w-52 lg:h-64 lg:w-64"
          aria-hidden
        />
        <FadeIn className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl">
            {t('landing.finalBandTitle')}
            <br />
            {t('landing.finalBandHighlight')}
          </h2>
          <p className="mt-4 text-[var(--color-on-primary)]/85">{t('landing.finalBandBody')}</p>
          <Link href="/browse" className="mt-8 inline-block">
            <Button size="lg" className="!bg-white !bg-none !text-[var(--color-primary-accent)]">
              {t('landing.finalBandCta')}
            </Button>
          </Link>
          <p className="mt-4 text-xs text-[var(--color-on-primary)]/60">{t('landing.finalBandNote')}</p>
        </FadeIn>
      </section>
    </div>
  );
}
