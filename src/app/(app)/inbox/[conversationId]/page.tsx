'use client';

import { use, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, BadgeCheck, UserRound } from 'lucide-react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { Button } from '@/components/ui/Button';
import { useChatSocket } from '@/lib/chat/ChatProvider';
import { useConversations, useLiveActivity, useMessages, useSendImageMessage } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ApiError, resolveUploadUrl } from '@/lib/api-client';
import type { ChatMessage } from '@/lib/types';

interface MessagesPage {
  items: ChatMessage[];
  total: number;
  page: number;
  pageSize: number;
}

const GROUP_GAP_MS = 5 * 60_000;

type ThreadEntry =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; message: ChatMessage; isMine: boolean; isFirstInGroup: boolean; isLastInGroup: boolean };

function dateLabel(date: Date, locale: 'en' | 'bn', todayLabel: string, yesterdayLabel: string): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOf(new Date());
  const target = startOf(date);
  if (target === today) return todayLabel;
  if (target === today - 86_400_000) return yesterdayLabel;
  return date.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildThreadEntries(
  messages: ChatMessage[],
  otherUserId: string | undefined,
  locale: 'en' | 'bn',
  todayLabel: string,
  yesterdayLabel: string,
): ThreadEntry[] {
  const entries: ThreadEntry[] = [];
  let lastDateKey: string | null = null;

  messages.forEach((message, index) => {
    const created = new Date(message.createdAt);
    const dayKey = created.toDateString();
    if (dayKey !== lastDateKey) {
      entries.push({ kind: 'date', key: `date-${dayKey}`, label: dateLabel(created, locale, todayLabel, yesterdayLabel) });
      lastDateKey = dayKey;
    }

    const prev = messages[index - 1];
    const next = messages[index + 1];
    const isMine = message.senderId !== otherUserId;

    const sameDayAsPrev = prev && new Date(prev.createdAt).toDateString() === dayKey;
    const isFirstInGroup =
      !prev || !sameDayAsPrev || prev.senderId !== message.senderId || created.getTime() - new Date(prev.createdAt).getTime() > GROUP_GAP_MS;

    const sameDayAsNext = next && new Date(next.createdAt).toDateString() === dayKey;
    const isLastInGroup =
      !next || !sameDayAsNext || next.senderId !== message.senderId || new Date(next.createdAt).getTime() - created.getTime() > GROUP_GAP_MS;

    entries.push({ kind: 'message', key: message.id, message, isMine, isFirstInGroup, isLastInGroup });
  });

  return entries;
}

export default function ConversationThreadPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const socket = useChatSocket();
  const [otherTyping, setOtherTyping] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  function scrollToBottom() {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  function handleScrollAreaScroll() {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 120;
  }

  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === conversationId);
  const { data: activeUsers } = useLiveActivity();
  const isOtherUserActive = !!conversation?.otherUser && activeUsers?.some((u) => u.userId === conversation.otherUser!.id);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMessages(conversationId);
  const sendImage = useSendImageMessage(conversationId);

  const messages = useMemo(() => {
    if (!data) return [];
    return [...data.pages].reverse().flatMap((page) => page.items);
  }, [data]);

  const threadEntries = useMemo(
    () => buildThreadEntries(messages, conversation?.otherUser?.id, locale, t('chat.today'), t('chat.yesterday')),
    [messages, conversation?.otherUser?.id, locale, t],
  );

  useEffect(() => {
    if (!socket) return;
    const activeSocket = socket;

    function handleNewMessage(message: ChatMessage) {
      if (message.conversationId !== conversationId) return;

      queryClient.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] } | undefined>(
        ['messages', conversationId],
        (old) => {
          if (!old) return old;
          const exists = old.pages.some((p) => p.items.some((m) => m.id === message.id));
          if (exists) return old;
          const pages = [...old.pages];
          pages[0] = { ...pages[0], items: [...pages[0].items, message] };
          return { ...old, pages };
        },
      );

      if (message.senderId !== conversation?.otherUser?.id) return;
      activeSocket.emit('message:read', { conversationId });
    }

    function handleTyping(payload: { conversationId: string; userId: string; typing: boolean }) {
      if (payload.conversationId !== conversationId) return;
      if (payload.userId === conversation?.otherUser?.id) setOtherTyping(payload.typing);
    }

    function handleRead(payload: { conversationId: string; readerId: string; readAt: string }) {
      if (payload.conversationId !== conversationId) return;

      queryClient.setQueryData<{ pages: MessagesPage[]; pageParams: unknown[] } | undefined>(
        ['messages', conversationId],
        (old) => {
          if (!old) return old;
          const pages = old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.senderId !== payload.readerId && !m.readAt ? { ...m, readAt: payload.readAt } : m,
            ),
          }));
          return { ...old, pages };
        },
      );
    }

    activeSocket.emit('message:read', { conversationId });
    activeSocket.on('message:new', handleNewMessage);
    activeSocket.on('typing:update', handleTyping);
    activeSocket.on('message:read', handleRead);

    return () => {
      activeSocket.off('message:new', handleNewMessage);
      activeSocket.off('typing:update', handleTyping);
      activeSocket.off('message:read', handleRead);
    };
  }, [socket, conversationId, conversation?.otherUser?.id, queryClient]);

  // Reset to "stuck to bottom" whenever the conversation itself changes.
  useLayoutEffect(() => {
    stickToBottomRef.current = true;
  }, [conversationId]);

  // Keep the view pinned to the newest message as messages arrive — but only
  // if the reader hasn't scrolled up to look at history (handleScrollAreaScroll
  // tracks that). useLayoutEffect so the jump happens before paint, not after.
  useLayoutEffect(() => {
    if (stickToBottomRef.current) scrollToBottom();
  }, [messages.length, otherTyping, pendingImageUrl]);

  function sendText(body: string) {
    if (!socket) return;
    stickToBottomRef.current = true;
    socket.emit('message:send', { conversationId, body });
  }

  function handleSendImage(file: File) {
    stickToBottomRef.current = true;
    const previewUrl = URL.createObjectURL(file);
    setPendingImageUrl(previewUrl);
    scrollToBottom();
    sendImage.mutate(file, {
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not send photo'),
      onSettled: () => {
        // The real message (with its server-hosted URL) arrives over the
        // socket, same as every other message — this preview's only job is to
        // cover the gap while the upload itself is in flight.
        URL.revokeObjectURL(previewUrl);
        setPendingImageUrl(null);
      },
    });
  }

  const resolvedPhoto = resolveUploadUrl(conversation?.otherUser?.photoUrl ?? null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <Link href="/inbox" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] md:hidden">
          <ArrowLeft size={20} />
        </Link>
        <Link href={conversation?.otherUser ? `/profile/${conversation.otherUser.id}` : '#'} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--color-surface)]">
          {resolvedPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolvedPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-sm text-[var(--color-text-faint)]">
              {conversation?.otherUser?.name?.charAt(0) ?? '?'}
            </div>
          )}
          {isOtherUserActive && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-success)]" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-[var(--color-text)]">
            <span className="truncate">{conversation?.otherUser?.name ?? '—'}</span>
            {conversation?.otherUser?.isVerified && <BadgeCheck size={14} className="shrink-0 text-[var(--color-verified)]" />}
          </p>
          {otherTyping ? (
            <p className="text-xs text-[var(--color-primary-accent)]">{t('chat.typing')}</p>
          ) : isOtherUserActive ? (
            <p className="flex items-center gap-1 text-xs text-[var(--color-success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" /> {t('chat.activeNow')}
            </p>
          ) : null}
        </div>
        {conversation?.otherUser && (
          <Link
            href={`/profile/${conversation.otherUser.id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary-accent)]"
            aria-label={t('chat.viewProfile')}
          >
            <UserRound size={18} />
          </Link>
        )}
      </header>

      <div ref={scrollAreaRef} onScroll={handleScrollAreaScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {hasNextPage && (
          <div className="mb-3 flex justify-center">
            <Button variant="secondary" size="md" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
              {t('checkout.history.loadMore')}
            </Button>
          </div>
        )}

        {isLoading ? (
          <ThreadSkeleton />
        ) : threadEntries.length === 0 && !pendingImageUrl ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 pt-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-faint)]">
              <UserRound size={24} />
            </div>
            <p className="max-w-[240px] text-sm text-[var(--color-text-muted)]">
              {t('chat.emptyThread', { name: conversation?.otherUser?.name ?? '' })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {threadEntries.map((entry) =>
              entry.kind === 'date' ? (
                <div key={entry.key} className="my-4 flex items-center justify-center">
                  <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-[11px] font-medium text-[var(--color-text-faint)]">
                    {entry.label}
                  </span>
                </div>
              ) : (
                <MessageBubble
                  key={entry.key}
                  message={entry.message}
                  isMine={entry.isMine}
                  isFirstInGroup={entry.isFirstInGroup}
                  isLastInGroup={entry.isLastInGroup}
                  avatarUrl={conversation?.otherUser?.photoUrl}
                  avatarFallback={conversation?.otherUser?.name?.charAt(0)}
                  onImageLoad={() => stickToBottomRef.current && scrollToBottom()}
                />
              ),
            )}
            {pendingImageUrl && <PendingImageBubble url={pendingImageUrl} />}
            {otherTyping && <TypingIndicator />}
          </div>
        )}
      </div>

      <ChatComposer
        onSendText={sendText}
        onSendImage={handleSendImage}
        onTypingStart={() => socket?.emit('typing:start', { conversationId })}
        onTypingStop={() => socket?.emit('typing:stop', { conversationId })}
        isSendingImage={sendImage.isPending}
      />
    </div>
  );
}

function PendingImageBubble({ url }: { url: string }) {
  return (
    <div className="mt-3 flex justify-end">
      <div className="relative max-w-[65%] overflow-hidden rounded-2xl shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="block max-h-80 w-full object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-scrim)]">
          <span className="h-6 w-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        </div>
      </div>
    </div>
  );
}

function ThreadSkeleton() {
  const widths = ['w-40', 'w-56', 'w-32', 'w-48', 'w-36'];
  return (
    <div className="flex animate-pulse flex-col gap-3">
      {widths.map((w, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`h-9 ${w} rounded-2xl bg-[var(--color-surface)]`} />
        </div>
      ))}
    </div>
  );
}
