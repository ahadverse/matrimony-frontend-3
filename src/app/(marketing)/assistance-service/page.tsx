'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ChevronDown, Heart, MessageCircleHeart, Sparkles, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { api, ApiError } from '@/lib/api-client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const steps = [
  { icon: UserCheck, titleKey: 'assistantService.step1Title', bodyKey: 'assistantService.step1Body' },
  { icon: Sparkles, titleKey: 'assistantService.step2Title', bodyKey: 'assistantService.step2Body' },
  { icon: Heart, titleKey: 'assistantService.step3Title', bodyKey: 'assistantService.step3Body' },
  { icon: MessageCircleHeart, titleKey: 'assistantService.step4Title', bodyKey: 'assistantService.step4Body' },
] as const;

const plans = [
  { labelKey: 'assistantService.plan3MonthsLabel', priceKey: 'assistantService.plan3MonthsPrice' },
  { labelKey: 'assistantService.plan6MonthsLabel', priceKey: 'assistantService.plan6MonthsPrice' },
] as const;

const faqs = [
  { qKey: 'assistantService.faq1Q', aKey: 'assistantService.faq1A' },
  { qKey: 'assistantService.faq2Q', aKey: 'assistantService.faq2A' },
  { qKey: 'assistantService.faq3Q', aKey: 'assistantService.faq3A' },
  { qKey: 'assistantService.faq4Q', aKey: 'assistantService.faq4A' },
  { qKey: 'assistantService.faq5Q', aKey: 'assistantService.faq5A' },
  { qKey: 'assistantService.faq6Q', aKey: 'assistantService.faq6A' },
] as const;

export default function AssistanceServicePage() {
  const { t } = useLanguage();

  function scrollToForm() {
    document.getElementById('assistance-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden px-6 pt-8 pb-16">
        <div
          className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-primary-dark)]/20 blur-[100px] animate-float-glow"
          aria-hidden
        />
        <Heart strokeWidth={1.25} className="absolute -right-16 top-6 h-56 w-56 -rotate-12 text-[var(--color-primary)]/15 sm:h-72 sm:w-72" aria-hidden />

        <div className="relative z-10 mx-auto mt-10 flex max-w-2xl flex-col items-center text-center">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-light)]">
              {t('assistantService.heroEyebrow')}
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-[var(--color-text)] sm:text-5xl">
              {t('assistantService.heroTitle')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-5 text-lg text-[var(--color-text-muted)]">{t('assistantService.heroSubtitle')}</p>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} className="relative z-10 mx-auto mt-12 max-w-3xl" id="assistance-form">
          <AssistanceForm />
        </FadeIn>
      </section>

      <section className="relative overflow-hidden bg-[var(--color-surface)] px-6 py-20">
        <Heart strokeWidth={1.25} className="absolute -left-14 bottom-0 h-44 w-44 -rotate-12 text-[var(--color-primary)]/10" aria-hidden />
        <div className="relative mx-auto max-w-4xl">
          <FadeIn className="flex flex-col items-center text-center">
            <h2 className="font-display text-2xl text-[var(--color-text)] sm:text-3xl">{t('assistantService.howTitle')}</h2>
          </FadeIn>

          <StaggerList className="relative mt-14 grid gap-10 sm:grid-cols-2">
            {steps.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <StaggerItem key={titleKey}>
                <Card className="flex h-full items-start gap-4 p-6">
                  <div className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-on-primary)] glow-primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-primary-accent)]">0{i + 1}</div>
                    <h3 className="font-display mt-1 text-lg text-[var(--color-text)]">{t(titleKey)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{t(bodyKey)}</p>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <FadeIn className="flex flex-col items-center text-center">
            <h2 className="font-display text-2xl text-[var(--color-text)] sm:text-3xl">{t('assistantService.pricingTitle')}</h2>
          </FadeIn>

          <StaggerList className="mt-10 grid gap-6 sm:grid-cols-2">
            {plans.map((plan) => (
              <StaggerItem key={plan.labelKey}>
                <Card className="flex h-full flex-col overflow-hidden p-0 text-center">
                  <div className="gradient-primary px-6 py-4 text-[var(--color-on-primary)]">
                    <span className="font-display text-lg">{t(plan.labelKey)}</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-5 p-6">
                    <span className="font-display text-3xl text-[var(--color-text)]">{t(plan.priceKey)}</span>
                    <Button onClick={scrollToForm} className="w-full">
                      {t('assistantService.planContinue')}
                    </Button>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--color-surface)] px-6 py-20">
        <div className="relative mx-auto max-w-3xl">
          <FadeIn className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
              {t('assistantService.faqEyebrow')}
            </span>
            <h2 className="font-display mt-3 text-2xl text-[var(--color-text)] sm:text-3xl">{t('assistantService.faqTitle')}</h2>
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
        </div>
      </section>
    </div>
  );
}

function AssistanceForm() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profileId, setProfileId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      api.post('assistant-requests', { name, phone, email, profileId: profileId || undefined }),
    onSuccess: () => {
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setProfileId('');
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : t('assistantService.formError')),
  });

  const isValid = name.trim() !== '' && phone.trim() !== '' && email.trim() !== '';

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="gradient-gold flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--color-on-gold)] glow-gold">
          <Users size={22} />
        </div>
        <h2 className="font-display mt-2 text-xl text-[var(--color-text)]">{t('assistantService.formTitle')}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">{t('assistantService.formSubtitle')}</p>
      </div>

      {submitted ? (
        <p className="mt-6 rounded-xl bg-[var(--color-success-tint)] px-4 py-3 text-center text-sm font-medium text-[var(--color-success)]">
          {t('assistantService.formSuccess')}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label={t('assistantService.formName')} required value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label={t('assistantService.formPhone')}
            type="tel"
            required
            placeholder="+8801XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label={t('assistantService.formEmail')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={t('assistantService.formProfileId')}
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          />
          <Button
            onClick={() => submit.mutate()}
            loading={submit.isPending}
            disabled={!isValid}
            className="sm:col-span-2"
          >
            {submit.isPending ? t('assistantService.formSubmitting') : t('assistantService.formSubmit')}
          </Button>
        </div>
      )}
    </Card>
  );
}
