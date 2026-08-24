'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { RichText } from '@/components/ui/RichText';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { api, ApiError } from '@/lib/api-client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const CONTACT_PHONE = '+880 1304 082381';
const CONTACT_EMAIL = 'biyekoralagbe@gmail.com';
const CONTACT_ADDRESS = 'Mujib Road (Community Hospital Bhabon, 4th floor), Sirajganj';

const socials = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
] as const;

export default function ContactUsPage() {
  const { t } = useLanguage();

  const details = [
    { icon: Phone, label: t('contactPage.phoneLabel'), value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`, tint: 'bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]' },
    { icon: Mail, label: t('contactPage.emailLabel'), value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, tint: 'bg-[var(--color-success-tint)] text-[var(--color-success)]' },
    { icon: MapPin, label: t('contactPage.addressLabel'), value: CONTACT_ADDRESS, href: null, tint: 'bg-[var(--color-gold-tint)] text-[var(--color-gold-accent)]' },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <nav className="text-xs text-[var(--color-text-faint)]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[var(--color-text)]">
          {t('contactPage.breadcrumbHome')}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-muted)]">{t('contactPage.breadcrumbContact')}</span>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        <FadeIn>
          <h1 className="font-display text-2xl leading-snug text-[var(--color-text)] sm:text-3xl">
            {t('contactPage.heroTitle')}
          </h1>

          <StaggerList className="mt-8 flex flex-col gap-4">
            {details.map(({ icon: Icon, label, value, href, tint }) => (
              <StaggerItem key={label}>
                <div className="flex items-start gap-4 rounded-2xl bg-[var(--color-surface)] p-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm break-words text-[var(--color-text-muted)] hover:text-[var(--color-primary-accent)]"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm break-words text-[var(--color-text-muted)]">{value}</p>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>

          <div className="mt-8">
            <p className="font-display text-base text-[var(--color-text)]">{t('contactPage.socialTitle')}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary-accent)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <ContactForm />
        </FadeIn>
      </div>
    </div>
  );
}

function ContactForm() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      api.post('contact-messages', {
        name,
        // Optional on this form, and the DTO rejects a too-short string — send
        // nothing rather than an empty one.
        phone: phone.trim() || undefined,
        email,
        subject,
        message,
      }),
    onSuccess: () => {
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
      setConsent(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : t('contactPage.formError')),
  });

  const isValid =
    name.trim() !== '' && email.trim() !== '' && subject.trim() !== '' && message.trim() !== '' && consent;

  return (
    <Card className="p-6 sm:p-8">
      <span className="inline-flex rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
        {t('contactPage.formEyebrow')}
      </span>
      <h2 className="font-display mt-4 text-xl text-[var(--color-text)] sm:text-2xl">
        {t('contactPage.formTitle')}
      </h2>
      <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{t('contactPage.formSubtitle')}</p>

      <hr className="rule-gold my-5" />

      {submitted ? (
        <p className="rounded-xl bg-[var(--color-success-tint)] px-4 py-3 text-center text-sm font-medium text-[var(--color-success)]">
          {t('contactPage.formSuccess')}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <Input
            label={t('contactPage.formName')}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label={t('contactPage.formPhone')}
            type="tel"
            placeholder="+8801XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label={t('contactPage.formEmail')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={t('contactPage.formSubject')}
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-message" className="text-sm font-medium text-[var(--color-text-muted)]">
              {t('contactPage.formMessage')}
              <span className="text-[var(--color-danger)]"> *</span>
            </label>
            <textarea
              id="contact-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
              <RichText
                tKey="contactPage.formConsent"
                values={{
                  terms: (
                    <Link href="/terms" className="text-[var(--color-primary-accent)] hover:underline">
                      {t('contactPage.formConsentTerms')}
                    </Link>
                  ),
                  privacy: (
                    <Link href="/privacy" className="text-[var(--color-primary-accent)] hover:underline">
                      {t('contactPage.formConsentPrivacy')}
                    </Link>
                  ),
                }}
              />
            </span>
          </label>

          <Button onClick={() => submit.mutate()} loading={submit.isPending} disabled={!isValid}>
            {submit.isPending ? t('contactPage.formSubmitting') : t('contactPage.formSubmit')}
          </Button>
        </div>
      )}
    </Card>
  );
}
