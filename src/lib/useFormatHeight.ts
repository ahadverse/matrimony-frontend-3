'use client';

import { useCallback } from 'react';
import { cmToFeetInches } from '@/lib/height';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * Height rendered in the reader's language — "5 ফুট 6 ইঞ্চি" rather than
 * "5 feet 6 inch".
 *
 * Separate from `formatHeight` in `lib/height.ts` because that one is a plain
 * function used outside React too; this is the version anything with a UI
 * should call. Digits stay Western, matching how the rest of the app prints
 * ages, counts and prices.
 */
export function useFormatHeight(): (cm: number | null | undefined) => string | null {
  const { t } = useLanguage();

  return useCallback(
    (cm: number | null | undefined) => {
      if (cm == null) return null;
      const { feet, inches } = cmToFeetInches(cm);
      return t('profileDetail.heightFormat', { feet, inches });
    },
    [t],
  );
}
