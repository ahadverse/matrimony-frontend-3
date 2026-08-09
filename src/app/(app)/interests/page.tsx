'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { BadgeCheck, Check, Gamepad2, Heart, MessageCircle, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StaggerItem, StaggerList } from '@/components/motion/StaggerList';
import {
  useConversations,
  useFilteredProfiles,
  useLikesYou,
  useMyLikes,
  useShortlist,
  useSwipeMutation,
  useUnlockProfile,
  useWallet,
} from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ApiError, resolveUploadUrl } from '@/lib/api-client';
import { formatLocation } from '@/lib/geo';
import type { LikedYouCard } from '@/lib/types';

type Tab = 'received' | 'shortlisted' | 'sent' | 'filtered';

function InterestsContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'received';
  const [tab, setTab] = useState<Tab>(initialTab);

  const { data: likesYou } = useLikesYou();
  const { data: myLikes } = useMyLikes();
  const { data: shortlist } = useShortlist();
  const { data: filtered } = useFilteredProfiles();
  const { data: conversations } = useConversations();
  const { data: wallet } = useWallet();
  const unlockMutation = useUnlockProfile();
  const [selected, setSelected] = useState<LikedYouCard | null>(null);

  const conversationByUserId = useMemo(() => {
    const map = new Map<string, string>();
    conversations?.forEach((c) => {
      if (c.otherUser) map.set(c.otherUser.id, c.id);
    });
    return map;
  }, [conversations]);

  function confirmUnlock() {
    if (!selected) return;
    unlockMutation.mutate(selected.userId, {
      onSuccess: () => setSelected(null),
      onError: (error) => {
        setSelected(null);
        if (error instanceof ApiError && error.status === 400) {
          toast.error(t('likesYou.insufficientBalance'));
          router.push('/checkout');
        } else {
          toast.error('Something went wrong');
        }
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        <Heart className="text-[var(--color-primary-accent)]" size={22} />
        <h1 className="font-display text-2xl text-[var(--color-text)]">{t('nav.interests')}</h1>
      </div>
      <p className="mb-5 text-sm text-[var(--color-text-muted)]">{t('interests.subtitle')}</p>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { value: 'received', label: t('interests.tabReceived'), count: likesYou?.length ?? 0 },
          { value: 'shortlisted', label: t('interests.tabShortlisted'), count: shortlist?.length ?? 0 },
          { value: 'sent', label: t('interests.tabSent'), count: myLikes?.length ?? 0 },
          { value: 'filtered', label: t('interests.tabFiltered'), count: filtered?.length ?? 0 },
        ]}
      />

      {tab === 'received' && (
        <EmptyableList empty={!likesYou || likesYou.length === 0} emptyLabel={t('likesYou.empty')}>
          <StaggerList className="flex flex-col gap-3">
            {likesYou?.map((card) => {
              const conversationId = conversationByUserId.get(card.userId);
              return (
                <StaggerItem key={card.userId}>
                  <InterestRow
                    photoUrl={card.unlocked ? card.photoUrl : card.photoUrl}
                    name={card.name}
                    meta={formatLocation(card)}
                    isVerified={card.isVerified}
                    dateLabel={new Date(card.likedAt).toLocaleDateString()}
                    locked={!card.unlocked}
                    onViewProfile={() => (card.unlocked ? router.push(`/profile/${card.userId}`) : setSelected(card))}
                    topAction={
                      conversationId ? (
                        <MessageButton onClick={() => router.push(`/inbox/${conversationId}`)} />
                      ) : (
                        <SendInterestBackButton targetId={card.userId} name={card.name} />
                      )
                    }
                  >
                    {conversationId && (
                      <MatchedPanel onMessage={() => router.push(`/inbox/${conversationId}`)} />
                    )}
                  </InterestRow>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </EmptyableList>
      )}

      {tab === 'shortlisted' && (
        <EmptyableList empty={!shortlist || shortlist.length === 0} emptyLabel={t('dashboard.shortlistedEmpty')}>
          <StaggerList className="flex flex-col gap-3">
            {shortlist?.map((card) => (
              <StaggerItem key={card.userId}>
                <InterestRow
                  photoUrl={card.photoUrl}
                  name={card.name}
                  meta={formatLocation(card)}
                  isVerified={card.isVerified}
                  dateLabel={new Date(card.shortlistedAt).toLocaleDateString()}
                  onViewProfile={() => router.push(`/profile/${card.userId}`)}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        </EmptyableList>
      )}

      {tab === 'sent' && (
        <EmptyableList empty={!myLikes || myLikes.length === 0} emptyLabel={t('myLikes.empty')}>
          <StaggerList className="flex flex-col gap-3">
            {myLikes?.map((card) => {
              const conversationId = conversationByUserId.get(card.userId);
              return (
                <StaggerItem key={card.userId}>
                  <InterestRow
                    photoUrl={card.photoUrl}
                    name={card.name}
                    meta={formatLocation(card)}
                    isVerified={card.isVerified}
                    dateLabel={new Date(card.likedAt).toLocaleDateString()}
                    statusLabel={conversationId ? t('interests.statusMatched') : t('interests.statusPending')}
                    statusTone={conversationId ? 'success' : 'neutral'}
                    onViewProfile={() => router.push(`/profile/${card.userId}`)}
                    topAction={conversationId ? <MessageButton onClick={() => router.push(`/inbox/${conversationId}`)} /> : undefined}
                  >
                    {conversationId && <MatchedPanel onMessage={() => router.push(`/inbox/${conversationId}`)} />}
                  </InterestRow>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </EmptyableList>
      )}

      {tab === 'filtered' && (
        <EmptyableList empty={!filtered || filtered.length === 0} emptyLabel={t('interests.filteredEmpty')}>
          <StaggerList className="flex flex-col gap-3">
            {filtered?.map((card) => (
              <StaggerItem key={card.userId}>
                <InterestRow
                  photoUrl={card.photoUrl}
                  name={card.name}
                  meta={formatLocation(card)}
                  isVerified={card.isVerified}
                  dateLabel={new Date(card.filteredAt).toLocaleDateString()}
                  statusLabel={t('interests.statusFiltered')}
                  statusTone="danger"
                  onViewProfile={() => router.push(`/profile/${card.userId}`)}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        </EmptyableList>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={t('likesYou.unlockModalTitle')}>
        {selected && (
          <div className="flex flex-col gap-4">
            <p className="rounded-xl bg-[var(--color-gold-tint)] p-3 text-sm font-medium text-[var(--color-gold-accent)]">
              {t('likesYou.unlockModalBody', { cost: `${t('common.taka')}${wallet?.profileViewCost ?? 200}` })}
            </p>
            <p className="text-xs text-[var(--color-text-faint)]">
              {t('likesYou.walletBalance', { balance: `${t('common.taka')}${wallet?.balance ?? 0}` })}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="gold" className="flex-1" onClick={confirmUnlock} loading={unlockMutation.isPending}>
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function InterestsPage() {
  return (
    <Suspense fallback={null}>
      <InterestsContent />
    </Suspense>
  );
}

function EmptyableList({ empty, emptyLabel, children }: { empty: boolean; emptyLabel: string; children: React.ReactNode }) {
  if (empty) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-faint)]">
          <Heart size={26} />
        </div>
        <p className="max-w-[260px] text-sm text-[var(--color-text-muted)]">{emptyLabel}</p>
      </div>
    );
  }
  return <>{children}</>;
}

function InterestRow({
  photoUrl,
  name,
  meta,
  isVerified,
  dateLabel,
  locked,
  statusLabel,
  statusTone = 'neutral',
  onViewProfile,
  topAction,
  children,
}: {
  photoUrl: string | null;
  name: string;
  meta: string;
  isVerified?: boolean;
  dateLabel: string;
  locked?: boolean;
  statusLabel?: string;
  statusTone?: 'success' | 'danger' | 'neutral';
  onViewProfile: () => void;
  topAction?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { t } = useLanguage();
  const resolved = resolveUploadUrl(photoUrl);
  const toneClass =
    statusTone === 'success'
      ? 'bg-[var(--color-success-tint)] text-[var(--color-success)]'
      : statusTone === 'danger'
        ? 'bg-[var(--color-danger-tint)] text-[var(--color-danger)]'
        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]';

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--color-surface)] ${locked ? 'blur-sm' : ''}`}>
          {resolved ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolved} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-lg text-[var(--color-text-faint)]">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-[var(--color-text)]">
            <span className="truncate">{name}</span>
            {isVerified && <BadgeCheck size={14} className="shrink-0 text-[var(--color-verified)]" />}
          </p>
          <p className="truncate text-xs text-[var(--color-text-faint)]">{meta}</p>
          <p className="text-xs text-[var(--color-text-faint)]">{dateLabel}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {statusLabel && <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>{statusLabel}</span>}
          <button onClick={onViewProfile} className="text-xs font-medium text-[var(--color-primary-accent)] hover:underline">
            {t('interests.viewProfile')} →
          </button>
          {topAction}
        </div>
      </div>
      {children}
    </Card>
  );
}

function MessageButton({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 gradient-primary rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-on-primary)] transition-colors hover:brightness-110"
    >
      <MessageCircle size={13} />
      {t('interests.message')}
    </button>
  );
}

function SendInterestBackButton({ targetId, name }: { targetId: string; name: string }) {
  const { t } = useLanguage();
  const swipe = useSwipeMutation();
  const [sent, setSent] = useState(false);

  if (sent || swipe.isSuccess) {
    return <span className="text-xs font-medium text-[var(--color-success)]">{t('interests.interestSent')}</span>;
  }

  return (
    <button
      onClick={() =>
        swipe.mutate(
          { targetId, action: 'like' },
          {
            onSuccess: (res) => {
              setSent(true);
              toast.success(res.matched ? t('browse.newMatchToast', { name }) : t('browse.likedToast', { name }));
            },
            onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not send interest'),
          },
        )
      }
      disabled={swipe.isPending}
      className="flex items-center gap-1.5 gradient-primary rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-on-primary)] transition-colors hover:brightness-110 disabled:opacity-60"
    >
      <Heart size={13} />
      {t('browse.sendInterest')}
    </button>
  );
}

function MatchedPanel({ onMessage }: { onMessage: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="mt-4 rounded-xl bg-[var(--color-success-tint)] p-4">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-success)]">
        <Check size={15} /> {t('interests.matchedTitle')}
      </p>
      <p className="mb-3 text-xs text-[var(--color-text-muted)]">{t('interests.matchedBody')}</p>
      <div className="grid grid-cols-3 gap-2">
        <button disabled className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs font-medium text-[var(--color-text-faint)] opacity-70">
          <Phone size={16} className="text-[var(--color-success)]" />
          {t('interests.voiceCall')}
        </button>
        <button
          onClick={onMessage}
          className="flex flex-col items-center gap-1.5 gradient-primary rounded-xl p-3 text-xs font-medium text-[var(--color-on-primary)]"
        >
          <MessageCircle size={16} />
          {t('interests.message')}
        </button>
        <button disabled className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs font-medium text-[var(--color-text-faint)] opacity-70">
          <Gamepad2 size={16} />
          {t('dashboard.dayTogetherTitle')}
        </button>
      </div>
    </div>
  );
}
