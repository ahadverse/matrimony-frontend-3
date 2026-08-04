'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useMyProfile } from '@/lib/queries';
import { resolveUploadUrl } from '@/lib/api-client';
import type { BrowseCard } from '@/lib/types';

interface MatchModalProps {
  match: { card: BrowseCard; conversationId: string } | null;
  onClose: () => void;
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  return (
    <div className="gradient-primary flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-[var(--color-gold)]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-3xl text-[var(--color-on-primary)]">{name.charAt(0)}</span>
      )}
    </div>
  );
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: myProfile } = useMyProfile();
  const myPhoto = resolveUploadUrl(myProfile?.photos.find((p) => p.isPrimary)?.url ?? myProfile?.photos[0]?.url ?? null);

  return (
    <Modal open={!!match} onClose={onClose} size="sm">
      {match && (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex items-center">
            <Avatar url={myPhoto} name={myProfile?.name ?? '?'} />
            <span className="-mx-3 z-10 flex h-9 w-9 items-center justify-center rounded-full gradient-gold text-[var(--color-on-gold)] shadow-md">
              <Heart size={16} fill="currentColor" />
            </span>
            <Avatar url={resolveUploadUrl(match.card.photoUrl)} name={match.card.name} />
          </div>
          <div>
            <h2 className="font-display text-2xl gradient-text">{t('browse.matchTitle')}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {t('browse.matchBody', { name: match.card.name })}
            </p>
          </div>
          <hr className="rule-gold w-full" />
          <div className="flex w-full flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => {
                router.push(`/inbox/${match.conversationId}`);
                onClose();
              }}
            >
              {t('browse.matchCta')}
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              {t('browse.matchLater')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
