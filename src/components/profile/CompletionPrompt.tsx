'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const DISMISS_KEY = 'biyekoralagbe_completion_prompt_dismissed';

/**
 * The nudge that replaces what registration no longer asks for.
 *
 * Signing up now collects only the essentials, which leaves most new members
 * around half complete — so this is where they are told, in as many words, that
 * a fuller profile makes a better impression, and pointed at Edit Profile.
 *
 * Dismissal is remembered per browser and re-armed whenever the score changes,
 * so someone who fills in a few more fields sees their progress again rather
 * than having silenced it for good.
 */
export function CompletionPrompt({ percent }: { percent: number }) {
  const { t } = useLanguage();
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      setDismissedAt(raw === null ? null : Number(raw));
    } catch {
      // Private windows and blocked site data throw on read — just show it.
      setDismissedAt(null);
    }
  }, []);

  if (percent >= 100 || dismissedAt === percent) return null;

  function dismiss() {
    setDismissedAt(percent);
    try {
      localStorage.setItem(DISMISS_KEY, String(percent));
    } catch {
      // Nothing to do — it simply reappears on the next visit.
    }
  }

  return (
    <Card className="relative p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('common.close')}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text)]"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <span className="gradient-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-on-primary)]">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-text)]">
            {t('auth.register.completePromptTitle')}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {t('auth.register.completePromptBody')}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">{t('settings.profileCompletion')}</span>
          <span className="font-bold text-[var(--color-primary-accent)]">{percent}%</span>
        </div>
        <ProgressBar percent={percent} />
      </div>

      <Link
        href="/edit-profile"
        className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary-accent)] hover:underline"
      >
        {t('auth.register.completePromptCta')} →
      </Link>
    </Card>
  );
}
