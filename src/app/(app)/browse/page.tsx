'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { SlidersHorizontal, UserRoundPen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { DeckSkeleton } from '@/components/swipe/DeckSkeleton';
import { DeckEmptyState } from '@/components/swipe/DeckEmptyState';
import { MatchModal } from '@/components/swipe/MatchModal';
import type { SwipeAction } from '@/components/swipe/useSwipeGesture';
import {
  useBrowseFeed,
  useDistricts,
  useMyProfile,
  useSwipeMutation,
  type BrowseFilters,
} from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ApiError } from '@/lib/api-client';
import type { BrowseCard } from '@/lib/types';

const MIN_BROWSE_COMPLETION_PERCENT = 80;
// Once fewer than this many cards remain, quietly top the deck back up —
// the backend excludes already-swiped ids server-side, so a plain refetch()
// is the refill; there's no cursor/page to track.
const REFILL_AT = 3;

export default function BrowsePage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<BrowseFilters>({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [match, setMatch] = useState<{ card: BrowseCard; conversationId: string } | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const completionPercent = profile?.completionPercent ?? 0;
  const canBrowse = completionPercent >= MIN_BROWSE_COMPLETION_PERCENT;

  const { data: cards, isLoading, isError, isFetching, refetch } = useBrowseFeed(filters, canBrowse);
  const swipe = useSwipeMutation();

  // The deck is UI state rather than the query cache. A refill response is a
  // server snapshot that can still list profiles this session already swiped
  // — the swipe POST may not have committed when the refill fired — so
  // writing it straight into the cache resurrected swiped cards and undid the
  // optimistic removal. Absorbing each id exactly once makes that impossible.
  const [deck, setDeck] = useState<BrowseCard[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const exhausted = useRef(false);

  const absorb = useCallback((incoming: BrowseCard[] | undefined) => {
    if (!incoming) return 0;
    const fresh = incoming.filter((c) => !seenIdsRef.current.has(c.id));
    if (fresh.length === 0) return 0;
    fresh.forEach((c) => seenIdsRef.current.add(c.id));
    setDeck((prev) => [...prev, ...fresh]);
    return fresh.length;
  }, []);

  // A different filter set is a genuinely different feed — start clean.
  // Done here rather than in an effect on `filters` because applying filters
  // is the only thing that changes them, so this is the event that owns it.
  function applyFilters(next: BrowseFilters) {
    seenIdsRef.current = new Set();
    exhausted.current = false;
    setDeck([]);
    setFilters(next);
  }

  useEffect(() => {
    absorb(cards);
  }, [cards, absorb]);

  useEffect(() => {
    if (!canBrowse || exhausted.current || isFetching) return;
    if (deck.length > REFILL_AT) return;
    // Latch on "returned nothing NEW", not "returned nothing at all": the
    // server keeps re-listing the cards still sitting in the deck, so the
    // empty-response check never fired and this refetched in a loop.
    refetch().then((res) => {
      if (absorb(res.data) === 0) exhausted.current = true;
    });
  }, [deck.length, isFetching, canBrowse, refetch, absorb]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => !!v).length,
    [filters],
  );

  function handleSwipe(card: BrowseCard, action: SwipeAction) {
    setDeck((prev) => prev.filter((c) => c.id !== card.id));

    swipe.mutate(
      { targetId: card.id, action },
      {
        onSuccess: (res) => {
          if (action === 'reject') return;
          if (res.matched && res.conversationId) {
            setMatch({ card, conversationId: res.conversationId });
          } else {
            toast.success(
              t(action === 'superlike' ? 'browse.superlikedToast' : 'browse.likedToast', { name: card.name }),
            );
          }
        },
        onError: (e) => {
          // 409 = already swiped from elsewhere — the card is genuinely gone,
          // don't restore it. Any other failure means the swipe never
          // recorded, so put the card back rather than silently losing it.
          if (e instanceof ApiError && e.status === 409) return;
          setDeck((prev) => (prev.some((c) => c.id === card.id) ? prev : [card, ...prev]));
          toast.error(t('browse.swipeFailed'));
        },
      },
    );
  }

  if (isProfileLoading) {
    return <div className="pt-24 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>;
  }

  if (!canBrowse) {
    return <ProfileCompletionGate percent={completionPercent} missingFields={profile?.missingFields ?? []} />;
  }

  return (
    <div className="mx-auto max-w-[420px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-text)]">{t('nav.profiles')}</h1>
          <p className="text-xs text-[var(--color-text-faint)]">{t('browse.deckHint')}</p>
        </div>
        <button
          onClick={() => setFilterModalOpen(true)}
          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
          }`}
        >
          <SlidersHorizontal size={14} />
          {activeFilterCount > 0 ? t('browse.filterCount', { count: activeFilterCount }) : t('browse.filterTitle')}
        </button>
      </div>

      {isLoading ? (
        <DeckSkeleton />
      ) : isError ? (
        <DeckEmptyState variant="error" onRetry={() => refetch()} />
      ) : deck.length === 0 ? (
        <DeckEmptyState
          variant={activeFilterCount > 0 ? 'filtered' : 'exhausted'}
          onClearFilters={() => applyFilters({})}
        />
      ) : (
        <SwipeStack cards={deck} onSwipe={handleSwipe} />
      )}

      <BrowseFilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApply={applyFilters}
      />
      <MatchModal match={match} onClose={() => setMatch(null)} />
    </div>
  );
}

function BrowseFilterModal({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: BrowseFilters;
  onApply: (f: BrowseFilters) => void;
}) {
  const { t } = useLanguage();
  const { data: districts } = useDistricts();
  // No effect needed to sync these from `filters`: Modal unmounts its
  // children while closed (see Modal.tsx), so this component remounts fresh
  // every time it opens and these initializers re-run automatically.
  const [district, setDistrict] = useState(filters.district ?? '');
  const [education, setEducation] = useState(filters.education ?? '');
  const [profession, setProfession] = useState(filters.profession ?? '');
  const [religion, setReligion] = useState(filters.religion ?? '');
  const [maritalStatus, setMaritalStatus] = useState(filters.maritalStatus ?? '');

  function apply() {
    onApply({
      district: district || undefined,
      education: education || undefined,
      profession: profession || undefined,
      religion: religion || undefined,
      maritalStatus: maritalStatus || undefined,
    });
    onClose();
  }

  function clear() {
    setDistrict('');
    setEducation('');
    setProfession('');
    setReligion('');
    setMaritalStatus('');
    onApply({});
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('browse.filtersTitle')}>
      <div className="flex flex-col gap-4">
        <SearchableSelect
          label={t('auth.register.district')}
          placeholder={t('auth.register.selectDistrict')}
          value={district}
          onChange={setDistrict}
          options={districts?.map((d) => d.name) ?? []}
        />
        <Select label="Education" placeholder={t('browse.anyEducation')} value={education} onChange={(e) => setEducation(e.target.value)}>
          {['SSC', 'HSC', 'Diploma', "Bachelor's", "Master's", 'PhD'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
        <Select label="Profession" placeholder={t('browse.anyProfession')} value={profession} onChange={(e) => setProfession(e.target.value)}>
          {['Student', 'Engineer', 'Doctor', 'Teacher', 'Business', 'Govt. Service'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
        <Select label="Religion" placeholder={t('browse.anyReligion')} value={religion} onChange={(e) => setReligion(e.target.value)}>
          {['Islam', 'Hinduism', 'Christianity', 'Buddhism'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
        <Select
          label={t('profileDetail.maritalStatus')}
          placeholder={t('browse.anyStatus')}
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
        >
          {(['single', 'divorced', 'widowed'] as const).map((s) => (
            <option key={s} value={s}>
              {t(`profileDetail.${s}`)}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" size="md" onClick={clear}>
            {t('browse.clearFilters')}
          </Button>
          <Button className="flex-1" size="md" onClick={apply}>
            {t('browse.applyFilters')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ProfileCompletionGate({ percent, missingFields }: { percent: number; missingFields: string[] }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 pt-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]">
        <UserRoundPen size={28} />
      </div>
      <div>
        <h2 className="font-display text-lg text-[var(--color-text)]">{t('browse.gateTitle')}</h2>
        <p className="mx-auto mt-1 max-w-[280px] text-sm text-[var(--color-text-muted)]">{t('browse.gateBody', { percent })}</p>
      </div>

      <Card className="w-full p-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
        <p className="mt-2 text-right text-xs font-medium text-[var(--color-text-faint)]">{percent}%</p>

        {missingFields.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {missingFields.map((field) => (
              <li key={field} className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">
                {t(`browse.gateMissing.${field}`)}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Link href="/edit-profile">
        <Button>{t('browse.gateCta')}</Button>
      </Link>
    </div>
  );
}
