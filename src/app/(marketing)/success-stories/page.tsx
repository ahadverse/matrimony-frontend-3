'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { usePublicStats } from '@/lib/queries';

const stories = [
  {
    names: 'Arif & Nadia',
    photo: 'https://loremflickr.com/1200/700/couple?lock=101',
    tags: ['Islam', 'Dhaka & Chattogram', 'February 2026'],
    metOnMarriedLater: 'Met on Biyekori — married 3 months later',
    quoteBn: '"আমি বিশ্বাস করতে পারিনি এত সহজে এবং নিরাপদে জীবনসঙ্গী খুঁজে পাওয়া যায়।"',
    quoteEn: '"I never believed finding a life partner could be this easy and this safe."',
    body: "Arif had tried two other platforms before Biyekori. Both times, the conversation went nowhere — no family involvement, no structure, no sense of seriousness. He almost stopped looking. Then his younger sister suggested Biyekori.",
    journey: [
      { title: 'The Match', body: "Arif noticed Nadia's profile had an AI match score of 91%. She had listed family values and deen as her top priorities — exactly what he was looking for, he sent an interest that evening." },
      { title: 'Families Connect', body: "Nadia's mother reviewed the biodata PDF her daughter had sent. She called it 'the most organized proposal' she had seen. Through Guardian Mode, both families started talking on the platform." },
      { title: 'First Meeting', body: 'After two weeks of on-platform conversation, Arif\'s parents travelled from Chattogram to Dhaka. Both families had lunch together. Conversation lasted three hours.' },
      { title: 'Nikah', body: 'The nikah took place in February 2026 — less than three months after Arif first sent that interest. Today they live in Dhaka. Nadia says the Guardian Mode feature made her family feel safe from day one.' },
    ],
  },
  {
    names: 'Raihan & Sumaiya',
    photo: 'https://loremflickr.com/1200/700/couple?lock=202',
    tags: ['Islam', 'Sylhet & Dhaka', 'March 2026'],
    metOnMarriedLater: 'Met on Biyekori — married 4 months later',
    quoteBn: '"পরিবার সবসময় পাশে ছিল - প্রতিটি ধাপে। এটাই বিয়েকরিকে অন্যদের থেকে আলাদা করে তুলেছে।"',
    quoteEn: "\"Our families were with us at every step. That's what made Biyekori different from everything else.\"",
    body: "Sumaiya's elder brother was managing her profile. She had asked him to — she felt safer that way. She shortlisted seven profiles after two weeks. Raihan was the first one the family agreed to contact.",
    journey: [
      { title: 'Guardian Shortlist', body: "Sumaiya's brother shortlisted Raihan based on the compatibility score and his verified profession. He sent an interest on her behalf through Guardian Mode." },
      { title: 'Biodata to Family', body: 'Both families downloaded the biodata PDFs and shared them with aunts and uncles over WhatsApp. The feedback from both sides was positive within days.' },
      { title: 'Supervised Video Call', body: "A video call was arranged through Biyekori. Sumaiya's mother sat beside her, Raihan's father joined from his side. Both families spoke directly for the first time." },
      { title: 'Nikah in Sylhet', body: 'The wedding took place in Sylhet in March 2026, with a reception in Dhaka the next week. Both families say they still talk daily.' },
    ],
  },
  {
    names: 'Imran & Farida',
    photo: 'https://loremflickr.com/1200/700/couple?lock=303',
    tags: ['Islam', 'London & Dhaka', 'April 2026'],
    metOnMarriedLater: 'Met on Biyekori — married 3 months later',
    quoteBn: '"প্রবাসে থেকে দেশের কাউকে বিয়ে করা কঠিন মনে হতো - বিয়েকরি সেই দূরত্ব ঘুচিয়ে দিয়েছে।"',
    quoteEn: 'Finding someone from home while living in London felt different from anywhere else.',
    body: "Imran had been looking to marry someone from Bangladesh — someone who shared his roots, his religion, his idea of family. Every platform he tried felt either too casual or too India-focused. A friend from Sylhet sent him a Biyekori link.",
    journey: [
      { title: 'A Match From Abroad', body: "Imran browsed profiles from Bangladesh while based in London. Within a week he found Farida's profile. She was a teacher, from Dhaka, and he sent an interest the same night." },
      { title: 'Across Time Zones', body: "They exchanged messages on the platform across a five-hour time difference. Farida's parents reviewed Imran's full biodata and spoke to parents in Sylhet by phone." },
      { title: 'Imran Flies to Dhaka', body: 'In January 2026, Imran flew home. Both families met in Dhaka over four days. Farida\'s father said "we felt like we already knew him."' },
      { title: 'Wedding & New Beginning', body: 'The nikah was in April 2026. Farida joined Imran in London two months later. Imran says: "Biyekori made it easy to find someone from home, wherever you\'re living."' },
    ],
  },
] as const;

export default function SuccessStoriesPage() {
  const { t } = useLanguage();
  const { data: publicStats } = usePublicStats();

  return (
    <div className="flex-1">
      <section className="px-6 pt-12 pb-8 text-center">
        <FadeIn>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
            {t('storiesPage.heroEyebrow')}
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight text-[var(--color-text)] sm:text-5xl">
            {t('storiesPage.heroTitle')}
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--color-text-muted)]">{t('storiesPage.heroSubtitle')}</p>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-text-faint)]">
            {publicStats ? `${publicStats.statVerifiedMembers} women and 3,099 men are looking for matches` : t('storiesPage.leadIn')}
          </p>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <StaggerList className="flex flex-col gap-10">
          {stories.map((story) => (
            <StaggerItem key={story.names}>
              <Card className="overflow-hidden p-0">
                <div className="relative flex h-56 items-end overflow-hidden p-6 text-[var(--color-on-primary)] sm:h-64">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.photo} alt={story.names} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="gradient-primary absolute inset-0 opacity-55" aria-hidden />
                  <Heart strokeWidth={1} className="absolute right-6 top-6 h-16 w-16 text-[var(--color-on-primary)]/25" aria-hidden />
                  <div className="relative">
                    <h2 className="font-display text-2xl sm:text-3xl">{story.names}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {story.tags.map((tag) => (
                        <Badge key={tag} tone="inverse">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">
                    {story.metOnMarriedLater}
                  </p>
                  <p className="font-display mt-2 text-lg text-[var(--color-text)]">{story.quoteBn}</p>
                  <p className="mt-1 text-sm italic text-[var(--color-text-muted)]">{story.quoteEn}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{story.body}</p>

                  <div className="mt-6 border-t border-[var(--color-border)] pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
                      Their journey
                    </p>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      {story.journey.map((step, i) => (
                        <div key={step.title} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-tint)] text-[11px] font-bold text-[var(--color-primary-accent)]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{step.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">{step.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      <section className="gradient-primary px-6 py-16 text-center text-[var(--color-on-primary)]">
        <FadeIn className="mx-auto max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-primary)]/70">Share your story</span>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl">Did you find your match on Biyekori?</h2>
          <p className="mt-3 text-[var(--color-on-primary)]/85">
            We would love to share your story. Names are always changed. Your story could give hope to someone still
            searching.
          </p>
          <Link href="/faq" className="mt-6 inline-block">
            <Button size="lg" className="!bg-white !bg-none !text-[var(--color-primary-accent)]">
              Share your story →
            </Button>
          </Link>
        </FadeIn>
      </section>

      <section className="px-6 py-16 text-center">
        <FadeIn className="mx-auto max-w-lg">
          <h2 className="font-display text-2xl text-[var(--color-text)] sm:text-3xl">{t('storiesPage.ctaTitle')}</h2>
          <p className="mt-4 text-[var(--color-text-muted)]">{t('storiesPage.ctaBody')}</p>
          <Link href="/register" className="mt-8 inline-block">
            <Button size="lg">{t('storiesPage.ctaButton')}</Button>
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
