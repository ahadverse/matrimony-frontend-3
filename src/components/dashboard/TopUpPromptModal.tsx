'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Wallet } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { getToken } from '@/lib/auth-token';
import { useWallet, usePublicProfiles } from '@/lib/queries';
import { resolveUploadUrl } from '@/lib/api-client';

const AVATAR_COUNT = 6;

interface AvatarSpot {
  url: string;
  topPercent: number;
  leftPercent: number;
  rotateDeg: number;
}

/** Scatters each avatar within its own slice of the banner so a handful of random draws can't cluster or overlap the center badge. */
function randomSpots(urls: string[]): AvatarSpot[] {
  const slices = 8;
  const order = Array.from({ length: slices }, (_, i) => i).sort(() => Math.random() - 0.5);
  return urls.map((url, i) => {
    const slice = order[i % slices];
    return {
      url,
      topPercent: 12 + Math.random() * 76,
      leftPercent: (slice / slices) * 100 + Math.random() * (100 / slices - 14) + 7,
      rotateDeg: Math.random() * 20 - 10,
    };
  });
}

const SEEN_FOR_TOKEN_KEY = 'biyekoralagbe_topup_modal_seen_token';

/**
 * There's no backend "first login" flag to key off of, so the access token
 * itself is the signal: registering and logging in both call setToken() with
 * a freshly issued JWT (see auth-token.ts), so remembering which token this
 * prompt was last shown for — and comparing it to the current one — tells us
 * this is a session the member hasn't seen the dashboard in yet, without a
 * server round trip or a new column on User.
 */
function useFreshSessionTopUpPrompt(): { open: boolean; dismiss: () => void } {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      if (localStorage.getItem(SEEN_FOR_TOKEN_KEY) !== token) setOpen(true);
    } catch {
      // Private windows / blocked storage: just skip the prompt this time.
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      const token = getToken();
      if (token) localStorage.setItem(SEEN_FOR_TOKEN_KEY, token);
    } catch {
      // Nothing to persist — worst case it shows again next load.
    }
  }

  return { open, dismiss };
}

export function TopUpPromptModal() {
  const { t } = useLanguage();
  const router = useRouter();
  const { open, dismiss } = useFreshSessionTopUpPrompt();
  const { data: wallet } = useWallet(open);

  // A handful of real female members' photos, scattered behind the badge —
  // "this is who's here" reads better than a stock banner for a top-up nudge.
  const { data: femaleProfiles } = usePublicProfiles({ gender: 'female' }, 1, open);
  const avatarUrls = useMemo(
    () =>
      (femaleProfiles?.items ?? [])
        .map((p) => resolveUploadUrl(p.photoUrl))
        .filter((url): url is string => !!url)
        .slice(0, AVATAR_COUNT),
    [femaleProfiles],
  );
  // Re-rolled only when the fetched set of urls actually changes, not on every
  // render — otherwise the avatars would visibly jump around on each rerender.
  const spots = useMemo(() => randomSpots(avatarUrls), [avatarUrls]);

  return (
    <Modal open={open} onClose={dismiss} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="gradient-primary relative h-32 w-full overflow-hidden rounded-2xl">
          {spots.length > 0 ? (
            spots.map((spot, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={spot.url}
                alt=""
                className="absolute h-11 w-11 rounded-full border-2 border-white/60 object-cover shadow-md sm:h-12 sm:w-12"
                style={{
                  top: `${spot.topPercent}%`,
                  left: `${spot.leftPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${spot.rotateDeg}deg)`,
                }}
              />
            ))
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/demo/cta-bg.webp" alt="" className="h-full w-full object-cover opacity-80" />
          )}
          <span className="gradient-gold absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-on-gold)] shadow-lg ring-4 ring-[var(--color-surface-raised)]">
            <Wallet size={24} />
          </span>
        </div>

        <div>
          <p className="flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-accent)]">
            <Sparkles size={14} />
            {t('dashboard.topupModal.eyebrow')}
          </p>
          <h2 className="mt-1 font-display text-2xl gradient-text">{t('dashboard.topupModal.title')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {t('dashboard.topupModal.body', {
              amount: `${t('common.taka')}${wallet?.minTopupAmount ?? 100}`,
            })}
          </p>
        </div>

        <hr className="rule-gold w-full" />

        <div className="flex w-full flex-col gap-2">
          <Button
            variant="gold"
            className="w-full"
            onClick={() => {
              dismiss();
              router.push('/checkout');
            }}
          >
            {t('dashboard.topupModal.cta')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={dismiss}>
            {t('dashboard.topupModal.later')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
