'use client';

import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/api-client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { Conversation } from '@/lib/types';

export function ConversationCard({ conversation }: { conversation: Conversation }) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const other = conversation.otherUser;
  const resolved = resolveUploadUrl(other?.photoUrl);
  const name = other?.name ?? '—';

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--color-surface)]">
        {resolved && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolved} alt={name} className="h-full w-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-lg text-[var(--color-text-faint)]">
            {name.charAt(0)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-semibold text-[var(--color-text)]">
          <span className="truncate">{name}</span>
          {other?.isVerified && (
            <BadgeCheck size={14} className="shrink-0 text-[var(--color-verified)]" aria-label={t('common.verified')} />
          )}
        </p>
        <p className="truncate text-xs text-[var(--color-text-faint)]">
          {conversation.lastMessage?.preview ?? t('inbox.newMatch')}
        </p>
      </div>

      {conversation.unreadCount > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full gradient-primary px-1.5 text-[10px] font-bold text-[var(--color-on-primary)]">
          {conversation.unreadCount}
        </span>
      )}
    </div>
  );
}
