'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * Bangla labels for the free-text profile vocabularies — qualifications,
 * professions, working sectors, religions, religious values, body types.
 *
 * These columns store plain English strings, and they have to keep doing so:
 * the admin panel's filters match them exactly, the public directory reads them
 * as query parameters, and profiles written by every earlier build already hold
 * those values. So this translates the *label only* — what goes in the database
 * is unchanged, and a value with no entry here (legacy spellings like "HSC" or
 * "Bachelor's", or anything typed by hand in the admin panel) falls through to
 * the stored string rather than rendering a raw translation key.
 *
 * Enum columns are not handled here; those already go through
 * `t('profileDetail.<enumKey>')`.
 */
const OPTION_SLUGS: Record<string, string> = {
  // QUALIFICATIONS
  SSC: 'ssc',
  'HSC / A-Level': 'hsc',
  Diploma: 'diploma',
  Undergraduate: 'undergraduate',
  Bachelors: 'bachelors',
  Masters: 'masters',
  'MBBS / BDS': 'mbbs',
  'FCPS / MD': 'fcps',
  'Doctorate / PhD / MPhil': 'doctorate',
  'Professional Degree': 'professionalDegree',

  // WORKING_SECTORS
  'Private Company': 'privateCompany',
  'Government / Public Sector': 'governmentSector',
  'Defense / Civil Services': 'defenceServices',
  'Business / Self Employed': 'selfEmployed',
  'Not Working': 'notWorking',

  // PROFESSIONAL_AREAS
  'Accounting & Banking': 'accountingBanking',
  'Administration & HR': 'adminHr',
  'Advertising & Media': 'advertisingMedia',
  Agriculture: 'agriculture',
  'Airline & Aviation': 'airlineAviation',
  'Architecture & Design': 'architectureDesign',
  'Artists & Animators': 'artistsAnimators',
  'Beauty & Fashion': 'beautyFashion',
  Defense: 'defence',
  'Education & Training': 'educationTraining',
  Engineering: 'engineering',
  'IT & Software Engineering': 'itSoftware',
  Legal: 'legal',
  'Medical & Healthcare': 'medicalHealthcare',
  'Sales & Marketing': 'salesMarketing',
  'Business & Others': 'businessOthers',
  Student: 'student',

  // RELIGIONS
  Islam: 'islam',
  Hinduism: 'hinduism',
  Christianity: 'christianity',
  Buddhism: 'buddhism',

  // RELIGIOUS_VALUES
  'Very religious': 'veryReligious',
  'Average religious': 'averageReligious',
  'Not religious': 'notReligious',

  // BODY_TYPES
  Average: 'bodyAverage',
  Slim: 'bodySlim',
  Athletic: 'bodyAthletic',
  Heavy: 'bodyHeavy',

  // Shared by several of the lists above.
  Others: 'others',
};

/**
 * Returns a formatter for one stored vocabulary value.
 *
 * `t` already falls back English-then-raw-key, and a raw key on screen is worse
 * than an untranslated word, so anything outside the map short-circuits to the
 * value itself before `t` is ever consulted.
 */
export function useOptionLabel(): (value: string | null | undefined) => string {
  const { t } = useLanguage();

  return useCallback(
    (value: string | null | undefined) => {
      if (!value) return '';
      const slug = OPTION_SLUGS[value];
      return slug ? t(`profileOptions.${slug}`) : value;
    },
    [t],
  );
}
