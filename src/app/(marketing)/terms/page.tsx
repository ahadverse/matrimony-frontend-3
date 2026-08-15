'use client';

import { LegalPage } from '@/components/marketing/LegalPage';

const SECTIONS = [
  'legal.termsS1',
  'legal.termsS2',
  'legal.termsS3',
  'legal.termsS4',
  'legal.termsS5',
  'legal.termsS6',
  'legal.termsS7',
  'legal.termsS8',
  'legal.termsS9',
  'legal.termsS10',
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      titleKey="legal.termsTitle"
      updatedKey="legal.termsUpdated"
      introKey="legal.intro"
      sectionKeys={SECTIONS}
      updated="15 August 2026"
    />
  );
}
