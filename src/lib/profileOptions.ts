import type {
  BloodGroup,
  Complexion,
  Diet,
  FamilyValues,
  MaritalStatus,
  ParentStatus,
  ProfileCreatedBy,
  Smoke,
} from './types';

/**
 * The vocabularies every profile form and filter draws from.
 *
 * Kept in one module because the registration wizard, the edit-profile tabs and
 * the public directory's sidebar all have to offer the *same* strings — a
 * filter that says "Bachelors" cannot match profiles saved as "Bachelor's".
 *
 * Free-text fields (education, profession, working sector, religion) are stored
 * as plain strings server-side, so these lists are the de-facto vocabulary
 * rather than a database constraint.
 */

export const QUALIFICATIONS = [
  'SSC',
  'HSC / A-Level',
  'Diploma',
  'Undergraduate',
  'Bachelors',
  'Masters',
  'MBBS / BDS',
  'FCPS / MD',
  'Doctorate / PhD / MPhil',
  'Professional Degree',
  'Others',
] as const;

export const WORKING_SECTORS = [
  'Private Company',
  'Government / Public Sector',
  'Defense / Civil Services',
  'Business / Self Employed',
  'Not Working',
] as const;

export const PROFESSIONAL_AREAS = [
  'Accounting & Banking',
  'Administration & HR',
  'Advertising & Media',
  'Agriculture',
  'Airline & Aviation',
  'Architecture & Design',
  'Artists & Animators',
  'Beauty & Fashion',
  'Defense',
  'Education & Training',
  'Engineering',
  'IT & Software Engineering',
  'Legal',
  'Medical & Healthcare',
  'Sales & Marketing',
  'Business & Others',
  'Student',
  'Not Working',
] as const;

export const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Others'] as const;

export const RELIGIOUS_VALUES = ['Very religious', 'Average religious', 'Not religious'] as const;

export const BODY_TYPES = ['Average', 'Slim', 'Athletic', 'Heavy'] as const;

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MARITAL_STATUSES: MaritalStatus[] = ['single', 'divorced', 'widowed'];

export const PROFILE_CREATED_BY: ProfileCreatedBy[] = [
  'self',
  'parents',
  'brother',
  'sister',
  'relative',
];

/**
 * Only the four the registration wizard offers. `medium` is deliberately absent
 * — it is a legacy value the backfill remaps, not something new profiles pick.
 */
export const COMPLEXIONS: Complexion[] = ['very_fair', 'fair', 'wheatish', 'dark'];

export const PARENT_STATUSES: ParentStatus[] = ['alive', 'deceased'];
export const FAMILY_VALUES: FamilyValues[] = ['traditional', 'moderate', 'liberal'];
export const DIETS: Diet[] = ['vegetarian', 'non_vegetarian', 'not_matter'];
export const SMOKE_OPTIONS: Smoke[] = ['non_smoker', 'smoker', 'light_social'];

/** The 8 divisions, matching the backend's bd-geo.json. */
export const BD_DIVISIONS = [
  'Barishal',
  'Chattogram',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
] as const;

export const MONTHLY_INCOME_BANDS = [
  { label: 'Below ৳20,000', value: 15000 },
  { label: '৳20,000 – ৳40,000', value: 30000 },
  { label: '৳40,000 – ৳70,000', value: 55000 },
  { label: '৳70,000 – ৳1,00,000', value: 85000 },
  { label: '৳1,00,000 – ৳2,00,000', value: 150000 },
  { label: 'Above ৳2,00,000', value: 250000 },
] as const;

/**
 * Turns an enum value into the label the translation files key on:
 * `non_vegetarian` → `NonVegetarian`, so `t('profileDetail.dietNonVegetarian')`
 * resolves. Used everywhere an enum is rendered, so the mapping lives once.
 */
export function enumKey(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
