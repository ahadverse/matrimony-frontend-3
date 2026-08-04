'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import clsx from 'clsx';
import { MessageCircle } from 'lucide-react';
import { ConversationCard } from '@/components/chat/ConversationCard';
import { useConversations } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const params = useParams<{ conversationId?: string }>();
  const activeId = params?.conversationId;
  const { data: conversations, isLoading } = useConversations();

  return (
    // flex-1 inside the (app) layout's flex column, instead of a 100vh calc:
    // 100vh is wrong on mobile browsers with a dynamic toolbar, and the old
    // fixed offset didn't account for the mobile bottom tab bar.
    // min-h-0 (not a min-height floor) so this always fits inside AppMain's
    // capped height — a floor taller than the viewport would push the
    // composer out of view on short screens.
    <div className="surface-card grid min-h-0 flex-1 overflow-hidden rounded-2xl md:grid-cols-[320px_1fr]">
      <div className={clsx('flex min-h-0 flex-col border-[var(--color-border)] md:border-r', activeId && 'hidden md:flex')}>
        <div className="shrink-0 border-b border-[var(--color-border)] px-4 py-3">
          <h1 className="font-display text-lg text-[var(--color-text)]">{t('inbox.title')}</h1>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="pt-16 text-center text-sm text-[var(--color-text-muted)]">{t('common.loading')}</div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 pt-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-faint)]">
                <MessageCircle size={24} />
              </div>
              <p className="max-w-[220px] text-sm text-[var(--color-text-muted)]">{t('inbox.empty')}</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-border)]">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/inbox/${conversation.id}`}
                  className={clsx(
                    'transition-colors hover:bg-[var(--color-surface)]',
                    activeId === conversation.id && 'bg-[var(--color-primary-tint)]',
                  )}
                >
                  <ConversationCard conversation={conversation} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={clsx('flex min-h-0 flex-col', !activeId && 'hidden md:flex')}>{children}</div>
    </div>
  );
}
