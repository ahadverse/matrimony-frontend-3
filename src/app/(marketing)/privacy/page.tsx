'use client';

import { LegalPage } from '@/components/marketing/LegalPage';

const SECTIONS = [
  'legal.privacyS1',
  'legal.privacyS2',
  'legal.privacyS3',
  'legal.privacyS4',
  'legal.privacyS5',
  'legal.privacyS6',
  'legal.privacyS7',
  'legal.privacyS8',
  'legal.privacyS9',
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      titleKey="legal.privacyTitle"
      updatedKey="legal.privacyUpdated"
      introKey="legal.privacyIntro"
      sectionKeys={SECTIONS}
      updated="15 August 2026"
    />
  );
}
