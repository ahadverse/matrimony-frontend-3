'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { PROFILE_FIELD_TABS } from '@/lib/profileFieldMap';

const TOTAL_FIELDS = 31;

interface CompletionPanelProps {
  percent: number;
  missingFields: string[];
  maxVisible?: number;
}

export function CompletionPanel({ percent, missingFields, maxVisible = 6 }: CompletionPanelProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const weight = Math.round(100 / TOTAL_FIELDS);
  const visible = expanded ? missingFields : missingFields.slice(0, maxVisible);
  const remaining = missingFields.length - visible.length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-text)]">{t('settings.profileCompletion')}</p>
        <p className="text-sm font-bold text-[var(--color-primary-accent)]">{percent}%</p>
      </div>
      <div className="mt-2">
        <ProgressBar percent={percent} />
      </div>

      {missingFields.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5">
          {visible.map((field) => (
            <Link
              key={field}
              href={`/edit-profile?tab=${PROFILE_FIELD_TABS[field] ?? 'basic'}&field=${field}`}
              className="flex items-center justify-between rounded-lg bg-[var(--color-warning-tint)] px-3 py-2 text-xs font-medium text-[var(--color-warning)] hover:brightness-95"
            >
              {t(`browse.gateMissing.${field}`)}
              <span>+{weight}%</span>
            </Link>
          ))}
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-1 text-center text-xs font-semibold text-[var(--color-primary-accent)] hover:underline"
            >
              +{remaining} {t('dashboard.moreRemaining')}
            </button>
          )}
          {expanded && missingFields.length > maxVisible && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-1 text-center text-xs font-semibold text-[var(--color-text-faint)] hover:underline"
            >
              {t('common.showLess')}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
