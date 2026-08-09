export type EditProfileTab = 'basic' | 'photos' | 'personal' | 'lifestyle' | 'partner' | 'verification' | 'privacy';

/** Maps a profile-completion field key (backend `profile-completion.ts`) to the
 * edit-profile tab that contains its input, so a missing-field link can deep-link
 * straight to it. */
export const PROFILE_FIELD_TABS: Record<string, EditProfileTab> = {
  name: 'basic',
  country: 'basic',
  state: 'basic',
  city: 'basic',
  zip: 'basic',
  // Kept so a profile last scored before worldwide locations still deep-links.
  district: 'basic',
  subDistrict: 'basic',
  bio: 'basic',
  profession: 'basic',
  education: 'basic',
  maritalStatus: 'basic',
  profileCreatedBy: 'basic',
  motherTongue: 'basic',
  englishComfort: 'basic',
  residencyStatus: 'basic',
  growUpIn: 'basic',
  collegeUniversity: 'basic',
  photo: 'photos',
  religion: 'personal',
  heightCm: 'personal',
  fatherOccupation: 'personal',
  motherOccupation: 'personal',
  siblingsCount: 'personal',
  numberOfSisters: 'personal',
  numberOfBrothers: 'personal',
  bloodGroup: 'personal',
  complexion: 'personal',
  monthlyIncome: 'personal',
  companyName: 'personal',
  presentAddress: 'personal',
  permanentAddress: 'personal',
  hobbies: 'lifestyle',
  familyFinancialStatus: 'lifestyle',
  bodyType: 'lifestyle',
  partnerPreferences: 'partner',
};
