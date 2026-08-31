'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Check, ChevronDown, Heart, MessageCircleHeart, Sparkles, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { api, ApiError } from '@/lib/api-client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ASSISTANCE_PLANS, type AssistancePlanId } from './plans';

const steps = [
  { icon: UserCheck, titleKey: 'assistantService.step1Title', bodyKey: 'assistantService.step1Body' },
  { icon: Sparkles, titleKey: 'assistantService.step2Title', bodyKey: 'assistantService.step2Body' },
  { icon: Heart, titleKey: 'assistantService.step3Title', bodyKey: 'assistantService.step3Body' },
  { icon: MessageCircleHeart, titleKey: 'assistantService.step4Title', bodyKey: 'assistantService.step4Body' },
] as const;

const faqs = [
  { qKey: 'assistantService.faq1Q', aKey: 'assistantService.faq1A' },
  { qKey: 'assistantService.faq2Q', aKey: 'assistantService.faq2A' },
  { qKey: 'assistantService.faq3Q', aKey: 'assistantService.faq3A' },
  { qKey: 'assistantService.faq4Q', aKey: 'assistantService.faq4A' },
  { qKey: 'assistantService.faq5Q', aKey: 'assistantService.faq5A' },
  { qKey: 'assistantService.faq6Q', aKey: 'assistantService.faq6A' },
  { qKey: 'assistantService.faq7Q', aKey: 'assistantService.faq7A' },
  { qKey: 'assistantService.faq8Q', aKey: 'assistantService.faq8A' },
] as const;

export default function AssistanceServicePage() {
  const { t } = useLanguage();
  // Lives here, not in AssistanceForm, because the pricing cards sit far below
  // the form and both have to agree on one selection — the plan a visitor picks
  // is submitted with the lead so sales knows what the enquiry is about.
  const [selectedPlan, setSelectedPlan] = useState<AssistancePlanId | null>(null);

  function choosePlan(id: AssistancePlanId) {
    setSelectedPlan(id);
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
          <FadeIn delay={0.22}>
            <p className="mx-auto mt-6 max-w-2xl text-left text-sm leading-relaxed text-[var(--color-text-muted)]">
              {t('assistantService.intro')}
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} className="relative z-10 mx-auto mt-12 max-w-3xl" id="assistance-form">
          <AssistanceForm selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
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

      {/* Prose block between the process cards and the price table — it answers
          the two questions a family asks before looking at a number: is this
          service meant for us, and what does the fee actually buy. */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2">
          <FadeIn>
            <h2 className="font-display text-xl text-[var(--color-text)]">{t('assistantService.whoTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {t('assistantService.whoBody')}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-display text-xl text-[var(--color-text)]">{t('assistantService.includedTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {t('assistantService.includedBody')}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <FadeIn className="flex flex-col items-center text-center">
            <h2 className="font-display text-2xl text-[var(--color-text)] sm:text-3xl">{t('assistantService.pricingTitle')}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-muted)]">
              {t('assistantService.pricingBody')}
            </p>
          </FadeIn>

          <StaggerList
            className="mt-10 grid gap-6 sm:grid-cols-2"
            role="group"
            aria-label={t('assistantService.planGroupLabel')}
          >
            {ASSISTANCE_PLANS.map((plan) => {
              const isSelected = plan.id === selectedPlan;
              return (
                <StaggerItem key={plan.id}>
                  {/* The selected ring is a ring rather than a border because
                      .surface-card sets an unlayered border that any Tailwind
                      border utility would lose to. */}
                  <Card
                    className={clsx(
                      'flex h-full flex-col overflow-hidden p-0 text-center',
                      isSelected && 'ring-2 ring-[var(--color-primary-accent)]',
                    )}
                  >
                    <div className="gradient-primary px-6 py-4 text-[var(--color-on-primary)]">
                      <span className="font-display text-lg">{t(`assistantService.${plan.labelKey}`)}</span>
                    </div>
                    <div
                      className={clsx(
                        'flex flex-1 flex-col items-center gap-5 p-6 transition-colors',
                        isSelected && 'bg-[var(--color-primary-tint)]',
                      )}
                    >
                      <span className="font-display text-3xl text-[var(--color-text)]">
                        {t(`assistantService.${plan.priceKey}`)}
                      </span>
                      <Button onClick={() => choosePlan(plan.id)} aria-pressed={isSelected} className="w-full">
                        {isSelected && <Check size={16} aria-hidden />}
                        {isSelected ? t('assistantService.planSelected') : t('assistantService.planContinue')}
                      </Button>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
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

function AssistanceForm({
  selectedPlan,
  onSelectPlan,
}: {
  selectedPlan: AssistancePlanId | null;
  onSelectPlan: (plan: AssistancePlanId | null) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profileId, setProfileId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      api.post('assistant-requests', {
        name,
        phone,
        email,
        profileId: profileId || undefined,
        plan: selectedPlan ?? undefined,
      }),
    onSuccess: () => {
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setProfileId('');
      onSelectPlan(null);
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
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <span id="assistance-plan-label" className="text-sm font-medium text-[var(--color-text-muted)]">
              {t('assistantService.formPlanLabel')}
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="assistance-plan-label">
              {ASSISTANCE_PLANS.map((plan) => (
                <PlanChip
                  key={plan.id}
                  label={t(`assistantService.${plan.labelKey}`)}
                  selected={plan.id === selectedPlan}
                  onSelect={() => onSelectPlan(plan.id)}
                />
              ))}
              <PlanChip
                label={t('assistantService.formPlanNone')}
                selected={selectedPlan === null}
                onSelect={() => onSelectPlan(null)}
              />
            </div>
            <p className="text-xs text-[var(--color-text-faint)]">{t('assistantService.formPlanHint')}</p>
          </div>
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

function PlanChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx(
        'h-10 rounded-xl border px-4 text-sm font-medium transition-colors',
        selected
          ? 'border-[var(--color-primary-accent)] bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]',
      )}
    >
      {label}
    </button>
  );
}
