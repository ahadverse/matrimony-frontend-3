'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Select } from '@/components/ui/Select';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { FadeIn } from '@/components/motion/FadeIn';
import { PublicProfileRow } from '@/components/profile/PublicProfileRow';
import { usePublicProfiles, useUnlockProfile, useWallet, type PublicProfileFilters } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ApiError } from '@/lib/api-client';
import { useIsSignedIn } from '@/lib/auth-token';
import { cmToFeetInches, feetInchesToCm } from '@/lib/height';
import { EMPTY_LOCATION, type ProfileLocation } from '@/lib/geo';
import {
  MARITAL_STATUSES,
  PROFESSIONAL_AREAS,
  QUALIFICATIONS,
  RELIGIONS,
  WORKING_SECTORS,
} from '@/lib/profileOptions';

const MIN_AGE = 18;
const MAX_AGE = 70;
const MIN_HEIGHT_CM = feetInchesToCm(4, 0);
const MAX_HEIGHT_CM = feetInchesToCm(6, 6);

const STRING_FILTER_KEYS = [
  'gender',
  'country',
  'state',
  'city',
  'education',
  'profession',
  'workingSector',
  'religion',
  'maritalStatus',
  'publicId',
] as const satisfies readonly (keyof PublicProfileFilters)[];

const NUMBER_FILTER_KEYS = [
  'ageMin',
  'ageMax',
  'heightMinCm',
  'heightMaxCm',
] as const satisfies readonly (keyof PublicProfileFilters)[];

// The homepage's hero search (and any other deep link) hands its criteria off
// as query params rather than router state, so the directory has to read them
// back out on first render instead of always starting from an empty filter set.
function filtersFromSearchParams(params: URLSearchParams): PublicProfileFilters {
  const filters: PublicProfileFilters = {};
  for (const key of STRING_FILTER_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }
  for (const key of NUMBER_FILTER_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = Number(value);
  }
  return filters;
}

export default function PublicProfilesPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="pt-24 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>}>
      <PublicProfilesContent />
    </Suspense>
  );
}

function PublicProfilesContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<PublicProfileFilters>(() => filtersFromSearchParams(searchParams));
  const [page, setPage] = useState(1);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const signedIn = useIsSignedIn();

  const { data, isLoading, isError, refetch } = usePublicProfiles(filters, page);
  // Only worth asking once there is a wallet to spend from — an anonymous
  // visitor sees the bare "Unlock" label and is sent to login on click.
  const { data: wallet } = useWallet(signedIn);
  const unlockMutation = useUnlockProfile();
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [confirmUnlockId, setConfirmUnlockId] = useState<string | null>(null);

  const applyFilters = useCallback((next: PublicProfileFilters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== undefined && v !== '').length,
    [filters],
  );

  function requestUnlock(userId: string) {
    // Sending an anonymous visitor to the unlock endpoint would only 401 — bounce
    // them to login with a return path so they land back on this list.
    if (!signedIn) {
      router.push(`/login?redirect=${encodeURIComponent(`${pathname}?${searchParams.toString()}`)}`);
      return;
    }
    setConfirmUnlockId(userId);
  }

  function confirmUnlock() {
    if (!confirmUnlockId) return;
    const userId = confirmUnlockId;
    setUnlockingId(userId);
    unlockMutation.mutate(userId, {
      onSuccess: () => {
        // The list is what changed — the unlocked row now has a name and a real
        // photo — so refetch rather than patching the cached page by hand.
        refetch();
        toast.success(t('profiles.unlocked'));
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 400) {
          toast.error(t('likesYou.insufficientBalance'));
          router.push('/checkout');
        } else {
          toast.error(t('profileDetail.unlockError'));
        }
      },
      onSettled: () => {
        setUnlockingId(null);
        setConfirmUnlockId(null);
      },
    });
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const unlockCost = wallet ? `${t('common.taka')}${wallet.profileViewCost}` : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-6">
        <h1 className="font-display text-3xl text-[var(--color-text)]">{t('profiles.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)]">{t('profiles.subtitle')}</p>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="hidden lg:block">
          <FiltersPanel filters={filters} onApply={applyFilters} />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {isLoading ? t('common.loading') : total === 1 ? t('profiles.foundOne') : t('profiles.found', { count: total })}
            </p>
            <button
              onClick={() => setFilterModalOpen(true)}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors lg:hidden ${
                activeFilterCount > 0
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] text-[var(--color-primary-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
              }`}
            >
              <SlidersHorizontal size={14} />
              {activeFilterCount > 0 ? t('profiles.filterCount', { count: activeFilterCount }) : t('profiles.filters')}
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-44 animate-pulse bg-[var(--color-surface)]" />
              ))}
            </div>
          ) : isError ? (
            <Card className="flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">{t('profiles.loadError')}</p>
              <Button variant="secondary" size="md" onClick={() => refetch()}>
                {t('common.retry')}
              </Button>
            </Card>
          ) : items.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">{t('profiles.none')}</p>
              {activeFilterCount > 0 && (
                <Button variant="secondary" size="md" onClick={() => applyFilters({})}>
                  {t('profiles.clearAll')}
                </Button>
              )}
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((profile) => (
                <PublicProfileRow
                  key={profile.userId}
                  profile={profile}
                  unlockCost={unlockCost}
                  onUnlock={() => requestUnlock(profile.userId)}
                  unlocking={unlockingId === profile.userId}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
        </div>
      </div>

      <Modal open={filterModalOpen} onClose={() => setFilterModalOpen(false)} title={t('profiles.filters')}>
        <FiltersPanel
          filters={filters}
          onApply={(next) => {
            applyFilters(next);
            setFilterModalOpen(false);
          }}
        />
      </Modal>

      <Modal open={!!confirmUnlockId} onClose={() => setConfirmUnlockId(null)} title={t('likesYou.unlockModalTitle')}>
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-[var(--color-gold-tint)] p-3 text-sm font-medium text-[var(--color-gold-accent)]">
            {t('likesYou.unlockModalBody', { cost: unlockCost ?? `${t('common.taka')}${wallet?.profileViewCost ?? 0}` })}
          </p>
          <p className="text-xs text-[var(--color-text-faint)]">
            {t('likesYou.walletBalance', { balance: `${t('common.taka')}${wallet?.balance ?? 0}` })}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmUnlockId(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="gold" className="flex-1" onClick={confirmUnlock} loading={unlockMutation.isPending}>
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FiltersPanel({
  filters,
  onApply,
}: {
  filters: PublicProfileFilters;
  onApply: (next: PublicProfileFilters) => void;
}) {
  const { t } = useLanguage();

  // Local draft state: filters only take effect on Apply, so typing an id or
  // dragging a slider doesn't fire a request per keystroke.
  const [draft, setDraft] = useState<PublicProfileFilters>(filters);
  const [location, setLocation] = useState<ProfileLocation>({
    ...EMPTY_LOCATION,
    country: filters.country ?? '',
    state: filters.state ?? '',
    city: filters.city ?? '',
  });
  const [ageMin, setAgeMin] = useState(filters.ageMin ?? MIN_AGE);
  const [ageMax, setAgeMax] = useState(filters.ageMax ?? MAX_AGE);
  const [heightMin, setHeightMin] = useState(filters.heightMinCm ?? MIN_HEIGHT_CM);
  const [heightMax, setHeightMax] = useState(filters.heightMaxCm ?? MAX_HEIGHT_CM);

  function set<K extends keyof PublicProfileFilters>(key: K, value: PublicProfileFilters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value || undefined }));
  }

  function apply() {
    onApply({
      ...draft,
      country: location.country || undefined,
      state: location.state || undefined,
      city: location.city || undefined,
      ageMin: ageMin > MIN_AGE ? ageMin : undefined,
      ageMax: ageMax < MAX_AGE ? ageMax : undefined,
      heightMinCm: heightMin > MIN_HEIGHT_CM ? heightMin : undefined,
      heightMaxCm: heightMax < MAX_HEIGHT_CM ? heightMax : undefined,
    });
  }

  function clear() {
    setDraft({});
    setLocation(EMPTY_LOCATION);
    setAgeMin(MIN_AGE);
    setAgeMax(MAX_AGE);
    setHeightMin(MIN_HEIGHT_CM);
    setHeightMax(MAX_HEIGHT_CM);
    onApply({});
  }

  return (
    <Card className="flex flex-col gap-5 p-4">
      <div>
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{t('profiles.gender')}</span>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {[
            { value: undefined, label: t('profiles.anyGender') },
            { value: 'male', label: t('profiles.male') },
            { value: 'female', label: t('profiles.female') },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => set('gender', option.value)}
              className={`h-9 rounded-lg border text-xs font-medium transition-colors ${
                draft.gender === option.value
                  ? 'border-transparent gradient-primary text-[var(--color-on-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{t('profiles.age')}</span>
        <div className="mt-1.5">
          <RangeSlider
            label="age"
            min={MIN_AGE}
            max={MAX_AGE}
            valueMin={ageMin}
            valueMax={ageMax}
            onChange={(min, max) => {
              setAgeMin(min);
              setAgeMax(max);
            }}
            formatValue={(v) => (v === MAX_AGE ? `${v}+` : String(v))}
          />
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{t('profiles.height')}</span>
        <div className="mt-1.5">
          <RangeSlider
            label="height"
            min={MIN_HEIGHT_CM}
            max={MAX_HEIGHT_CM}
            valueMin={heightMin}
            valueMax={heightMax}
            onChange={(min, max) => {
              setHeightMin(min);
              setHeightMax(max);
            }}
            formatValue={(cm) => {
              const { feet, inches } = cmToFeetInches(cm);
              return `${feet}'${inches}"`;
            }}
          />
        </div>
      </div>

      <LocationPicker showZip={false} value={location} onChange={setLocation} />

      <Select
        label={t('profiles.education')}
        placeholder={t('profiles.anyEducation')}
        value={draft.education ?? ''}
        onChange={(e) => set('education', e.target.value)}
      >
        <option value="">{t('profiles.anyEducation')}</option>
        {QUALIFICATIONS.map((q) => (
          <option key={q} value={q}>
            {q}
          </option>
        ))}
      </Select>

      <Select
        label={t('profiles.professionalArea')}
        placeholder={t('profiles.anyProfession')}
        value={draft.profession ?? ''}
        onChange={(e) => set('profession', e.target.value)}
      >
        <option value="">{t('profiles.anyProfession')}</option>
        {PROFESSIONAL_AREAS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>

      <Select
        label={t('profiles.workingSector')}
        placeholder={t('profiles.anySector')}
        value={draft.workingSector ?? ''}
        onChange={(e) => set('workingSector', e.target.value)}
      >
        <option value="">{t('profiles.anySector')}</option>
        {WORKING_SECTORS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Select
        label={t('profiles.religion')}
        placeholder={t('profiles.anyReligion')}
        value={draft.religion ?? ''}
        onChange={(e) => set('religion', e.target.value)}
      >
        <option value="">{t('profiles.anyReligion')}</option>
        {RELIGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>

      <Select
        label={t('profiles.maritalStatus')}
        placeholder={t('profiles.anyStatus')}
        value={draft.maritalStatus ?? ''}
        onChange={(e) => set('maritalStatus', e.target.value)}
      >
        <option value="">{t('profiles.anyStatus')}</option>
        {MARITAL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`profileDetail.${s}`)}
          </option>
        ))}
      </Select>

      <Input
        label={t('profiles.searchProfileId')}
        placeholder={t('profiles.profileIdPlaceholder')}
        value={draft.publicId ?? ''}
        onChange={(e) => set('publicId', e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') apply();
        }}
      />

      <div className="flex gap-2">
        <Button variant="secondary" size="md" onClick={clear} aria-label={t('profiles.clearAll')}>
          <X size={16} />
        </Button>
        <Button size="md" className="flex-1" onClick={apply}>
          <Search size={14} /> {t('profiles.applyFilters')}
        </Button>
      </div>
    </Card>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useLanguage();

  // A sliding window of at most five numbers, clamped to the ends, so a large
  // result set doesn't render a hundred buttons.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const numbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  function go(next: number) {
    onChange(Math.max(1, Math.min(totalPages, next)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const stepClasses =
    'rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-40 disabled:hover:border-[var(--color-border)]';

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label={t('profiles.title')}>
      <button className={stepClasses} onClick={() => go(1)} disabled={page === 1}>
        {t('profiles.first')}
      </button>
      <button className={stepClasses} onClick={() => go(page - 1)} disabled={page === 1}>
        {t('profiles.previous')}
      </button>

      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => go(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
            n === page
              ? 'gradient-primary text-[var(--color-on-primary)]'
              : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
          }`}
        >
          {n}
        </button>
      ))}

      <button className={stepClasses} onClick={() => go(page + 1)} disabled={page === totalPages}>
        {t('profiles.next')}
      </button>
      <button className={stepClasses} onClick={() => go(totalPages)} disabled={page === totalPages}>
        {t('profiles.last')}
      </button>
    </nav>
  );
}
