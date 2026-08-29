'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  BriefcaseBusiness,
  Building2,
  Cigarette,
  Droplet,
  Flag,
  Globe2,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Languages,
  Mail,
  MapPin,
  Phone,
  PersonStanding,
  Ruler,
  Salad,
  School,
  Scale,
  Users,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { formatHeight } from '@/lib/height';
import { formatLocationFull } from '@/lib/geo';
import { enumKey } from '@/lib/profileOptions';
import type { LockedProfile, UnlockedProfile } from '@/lib/types';

interface Field {
  icon: LucideIcon;
  label: string;
  value: string | null;
}

interface Section {
  key: string;
  title: string;
  fields: Field[];
  /** Long-form prose rendered under the grid rather than inside a tile. */
  prose?: { label: string; value: string | null }[];
}

/**
 * Renders a profile's bio-data, grouped the way the registration wizard
 * collects it.
 *
 * Takes the discriminated `LockedProfile | UnlockedProfile` rather than a bag
 * of props so the contact section can only be built when `locked` is false —
 * a locked profile has no `phone`/`email`/address keys to read, which makes
 * leaking them here a type error rather than a review catch.
 */
export function ProfileBioSections({ profile }: { profile: LockedProfile | UnlockedProfile }) {
  const { t } = useLanguage();

  const optional = (value: string | number | null | undefined): string | null =>
    value === null || value === undefined || value === '' ? null : String(value);

  const translateEnum = (prefix: string, value: string | null): string | null =>
    value ? t(`profileDetail.${prefix}${enumKey(value)}`) : null;

  const sections: Section[] = [
    {
      key: 'basic',
      title: t('profileDetail.sectionBasic'),
      fields: [
        {
          icon: UserRound,
          label: t('profileDetail.gender'),
          value: profile.gender ? t(`profiles.${profile.gender}`) : null,
        },
        { icon: Baby, label: t('editProfile.age'), value: optional(profile.age) },
        { icon: Heart, label: t('profileDetail.maritalStatus'), value: t(`profileDetail.${profile.maritalStatus}`) },
        { icon: Heart, label: t('profileDetail.religion'), value: optional(profile.religion) },
        { icon: Flag, label: t('profileDetail.nationality'), value: optional(profile.nationality) },
        {
          icon: Users,
          label: t('auth.register.profileCreatedBy'),
          value: profile.profileCreatedBy
            ? t(`auth.register.profileCreatedBy${enumKey(profile.profileCreatedBy)}`)
            : null,
        },
        {
          icon: UserRound,
          label: t('profileDetail.relativeName'),
          value: profile.locked ? null : optional(profile.relativeName),
        },
      ],
    },
    {
      key: 'education',
      title: t('profileDetail.sectionEducation'),
      fields: [
        { icon: GraduationCap, label: t('profileDetail.education'), value: optional(profile.education) },
        { icon: School, label: t('editProfile.collegeUniversity'), value: optional(profile.collegeUniversity) },
        { icon: BriefcaseBusiness, label: t('profileDetail.profession'), value: optional(profile.profession) },
        { icon: BriefcaseBusiness, label: t('profileDetail.workingSector'), value: optional(profile.workingSector) },
        { icon: Building2, label: t('profileDetail.company'), value: optional(profile.companyName) },
        {
          icon: Wallet,
          label: t('profileDetail.monthlyIncome'),
          // A private income still shows the row, labelled as withheld, so the
          // gap reads as a deliberate choice rather than an unfilled field.
          value: profile.incomeIsPrivate
            ? t('profileDetail.incomePrivate')
            : optional(profile.monthlyIncome && `${t('common.taka')}${profile.monthlyIncome}`),
        },
      ],
      prose: [
        { label: t('profileDetail.educationDetails'), value: optional(profile.educationDetails) },
        { label: t('profileDetail.professionDetails'), value: optional(profile.professionDetails) },
      ],
    },
    {
      key: 'family',
      title: t('profileDetail.sectionFamily'),
      fields: [
        {
          icon: Users,
          label: t('profileDetail.fatherStatus'),
          value: translateEnum('parentStatus', profile.fatherStatus),
        },
        { icon: Users, label: t('profileDetail.fatherOccupation'), value: optional(profile.fatherOccupation) },
        {
          icon: Users,
          label: t('profileDetail.motherStatus'),
          value: translateEnum('parentStatus', profile.motherStatus),
        },
        { icon: Users, label: t('profileDetail.motherOccupation'), value: optional(profile.motherOccupation) },
        { icon: Baby, label: t('profileDetail.siblings'), value: optional(profile.siblingsCount) },
        { icon: Baby, label: t('browse.gateMissing.numberOfBrothers'), value: optional(profile.numberOfBrothers) },
        { icon: Baby, label: t('browse.gateMissing.numberOfSisters'), value: optional(profile.numberOfSisters) },
        { icon: Baby, label: t('profileDetail.brothersMarried'), value: optional(profile.brothersMarried) },
        { icon: Baby, label: t('profileDetail.brothersUnmarried'), value: optional(profile.brothersUnmarried) },
        { icon: Baby, label: t('profileDetail.sistersMarried'), value: optional(profile.sistersMarried) },
        { icon: Baby, label: t('profileDetail.sistersUnmarried'), value: optional(profile.sistersUnmarried) },
        {
          icon: Wallet,
          label: t('editProfile.familyFinancialStatus'),
          value: optional(profile.familyFinancialStatus),
        },
      ],
      prose: [{ label: t('profileDetail.familyDetails'), value: optional(profile.familyDetails) }],
    },
    {
      key: 'location',
      title: t('profileDetail.sectionLocation'),
      fields: [
        { icon: MapPin, label: t('profileDetail.sectionLocation'), value: optional(formatLocationFull(profile)) },
        { icon: Home, label: t('editProfile.growUpIn'), value: optional(profile.growUpIn) },
        { icon: Globe2, label: t('editProfile.residencyStatus'), value: optional(profile.residencyStatus) },
        {
          icon: Home,
          label: t('profileDetail.presentAddress'),
          value: profile.locked ? null : optional(profile.presentAddress),
        },
        {
          icon: Home,
          label: t('profileDetail.permanentAddress'),
          value: profile.locked ? null : optional(profile.permanentAddress),
        },
        {
          icon: MapPin,
          label: t('auth.register.zip'),
          value: profile.locked ? null : optional(profile.zip),
        },
      ],
    },
    {
      key: 'physical',
      title: t('profileDetail.sectionPhysical'),
      fields: [
        { icon: Ruler, label: t('profileDetail.height'), value: formatHeight(profile.heightCm) },
        { icon: Scale, label: t('profileDetail.weight'), value: optional(profile.weightKg && `${profile.weightKg} kg`) },
        { icon: PersonStanding, label: t('editProfile.bodyType'), value: optional(profile.bodyType) },
        {
          icon: Droplet,
          label: t('profileDetail.complexion'),
          value: translateEnum('complexion', profile.complexion),
        },
        { icon: Droplet, label: t('profileDetail.bloodGroup'), value: optional(profile.bloodGroup) },
      ],
      prose: [{ label: t('profileDetail.physicalDetails'), value: optional(profile.physicalDetails) }],
    },
    {
      key: 'lifestyle',
      title: t('profileDetail.sectionLifestyle'),
      fields: [
        { icon: Heart, label: t('profileDetail.religiousValue'), value: optional(profile.religiousValue) },
        {
          icon: HeartHandshake,
          label: t('profileDetail.familyValues'),
          value: translateEnum('familyValues', profile.familyValues),
        },
        { icon: Salad, label: t('profileDetail.diet'), value: translateEnum('diet', profile.diet) },
        { icon: Cigarette, label: t('profileDetail.smoke'), value: translateEnum('smoke', profile.smoke) },
        { icon: Languages, label: t('editProfile.motherTongue'), value: optional(profile.motherTongue) },
        { icon: Languages, label: t('editProfile.englishComfort'), value: optional(profile.englishComfort) },
      ],
      prose: [{ label: t('editProfile.hobbies'), value: optional(profile.hobbies) }],
    },
    {
      key: 'about',
      title: t('profileDetail.sectionAbout'),
      fields: [],
      prose: [
        { label: t('profileDetail.about'), value: optional(profile.bio) },
        { label: t('editProfile.partnerPreferences'), value: optional(profile.partnerPreferences) },
      ],
    },
  ];

  // Contact details are what unlocking buys, so this section exists only on the
  // unlocked branch — there is no locked shape to accidentally read them from.
  // The guardian's number sits here rather than under Basic: a family running
  // the profile is who a match actually rings, so it belongs with the phone and
  // email it is an alternative to.
  if (!profile.locked) {
    sections.push({
      key: 'contact',
      title: t('profileDetail.sectionContact'),
      fields: [
        { icon: Phone, label: t('profileDetail.phone'), value: optional(profile.phone) },
        { icon: Mail, label: t('profileDetail.email'), value: optional(profile.email) },
        { icon: Phone, label: t('profileDetail.relativePhone'), value: optional(profile.relativePhone) },
      ],
    });
  }

  const visible = sections
    .map((section) => ({
      ...section,
      fields: section.fields.filter((f) => f.value),
      prose: (section.prose ?? []).filter((p) => p.value),
    }))
    .filter((section) => section.fields.length > 0 || section.prose.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {visible.map((section) => (
        <section key={section.key}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
            {section.title}
          </h2>
          <hr className="rule-gold mt-2" />

          {section.fields.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {section.fields.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-[var(--color-surface)] p-3">
                  <Icon size={16} className="text-[var(--color-primary-light)]" />
                  <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">{label}</p>
                  <p className="text-sm font-medium break-words text-[var(--color-text)]">{value}</p>
                </div>
              ))}
            </div>
          )}

          {section.prose.map((entry) => (
            <div key={entry.label} className="mt-3">
              <p className="text-xs text-[var(--color-text-faint)]">{entry.label}</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-[var(--color-text-muted)]">
                {entry.value}
              </p>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
