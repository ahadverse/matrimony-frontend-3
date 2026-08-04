'use client';

import { Compass, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface DeckEmptyStateProps {
  variant: 'exhausted' | 'filtered' | 'error';
  onClearFilters?: () => void;
  onRetry?: () => void;
}

export function DeckEmptyState({ variant, onClearFilters, onRetry }: DeckEmptyStateProps) {
  const { t } = useLanguage();

  const icon =
    variant === 'filtered' ? <SlidersHorizontal size={28} /> : variant === 'error' ? <RefreshCw size={28} /> : <Compass size={28} />;
  const title = t(
    variant === 'filtered' ? 'browse.emptyFilteredTitle' : variant === 'error' ? 'browse.errorTitle' : 'browse.emptyTitle',
  );
  const body =
    variant === 'filtered'
      ? t('browse.emptyFilteredBody')
      : variant === 'error'
        ? t('browse.errorBody')
        : t('browse.empty');

  return (
    <div className="mx-auto flex max-w-[320px] flex-col items-center gap-4 pt-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold-tint)] text-[var(--color-gold-accent)]">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-lg text-[var(--color-text)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{body}</p>
      </div>
      {variant === 'filtered' && onClearFilters && (
        <Button variant="secondary" onClick={onClearFilters}>
          {t('browse.clearFilters')}
        </Button>
      )}
      {variant === 'error' && onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
    </div>
  );
}
