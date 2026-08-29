export type Gender = 'male' | 'female';
export type MaritalStatus = 'single' | 'divorced' | 'widowed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
/** `medium` is legacy — the backfill remaps it to `wheatish`; see the backend enum. */
export type Complexion = 'very_fair' | 'fair' | 'wheatish' | 'medium' | 'dark';
export type ProfileCreatedBy = 'self' | 'parents' | 'brother' | 'sister' | 'relative';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ParentStatus = 'alive' | 'deceased';
export type FamilyValues = 'traditional' | 'moderate' | 'liberal';
export type Diet = 'vegetarian' | 'non_vegetarian' | 'not_matter';
export type Smoke = 'non_smoker' | 'smoker' | 'light_social';

export interface MyVerification {
  id: string;
  nidNumber: string;
  selfieUrl: string;
  status: VerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  /** Null until the wizard's last step (or ever, for someone who skips it) verifies a phone. */
  phone: string | null;
  email: string | null;
  gender: Gender;
  dob: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  walletBalance: number;
  languagePref: 'en' | 'bn';
  hasLocation: boolean;
}

/** Shape returned by the backend's /auth/login, /auth/register and /auth/reset-password. */
export interface AuthResponse {
  accessToken: string;
  user: Pick<CurrentUser, 'id' | 'phone' | 'email' | 'gender' | 'role' | 'status' | 'walletBalance'>;
}

/** Shape returned by /auth/oauth/exchange — an AuthResponse plus whether the bio-data wizard still needs to run. */
export interface OAuthExchangeResponse extends AuthResponse {
  needsOnboarding: boolean;
}

export interface District {
  name: string;
  division: string;
}

/**
 * Location fields returned on every profile-bearing payload.
 *
 * `district`/`subDistrict` are the pre-worldwide Bangladesh pair; the backend
 * keeps them mirrored to `state`/`city` for the admin panel and the older
 * frontends. Read `country`/`state`/`city` here — `lib/geo.ts` has the
 * formatters, which fall back to the legacy pair when needed.
 */
export interface LocationFields extends CoarseLocationFields {
  district: string | null;
  subDistrict: string | null;
  city: string | null;
}

/**
 * The part of the above a locked profile carries — the district is what the
 * unlock fee buys, so the backend leaves those keys off that payload entirely.
 */
export interface CoarseLocationFields {
  country: string | null;
  countryCode: string | null;
  state: string | null;
}

export interface Photo {
  id: string;
  url: string;
  blurredUrl: string;
  isPrimary: boolean;
  order: number;
}

/**
 * The bio-data every profile carries, and the exact set a *locked* profile is
 * allowed to expose. Deliberately excludes name, phone, email and the street
 * addresses — see the backend's `common/utils/profile-visibility.ts`, which is
 * the enforcing counterpart of this type.
 */
export interface ProfileBioData {
  bio: string | null;
  religion: string | null;
  maritalStatus: MaritalStatus;
  profileCreatedBy: ProfileCreatedBy | null;
  nationality: string | null;

  education: string | null;
  educationDetails: string | null;
  collegeUniversity: string | null;
  profession: string | null;
  professionDetails: string | null;
  workingSector: string | null;
  companyName: string | null;
  /** Null when the member marked their income private — check `incomeIsPrivate`. */
  monthlyIncome: number | null;
  incomeIsPrivate: boolean;

  fatherStatus: ParentStatus | null;
  fatherOccupation: string | null;
  motherStatus: ParentStatus | null;
  motherOccupation: string | null;
  siblingsCount: number | null;
  numberOfBrothers: number | null;
  numberOfSisters: number | null;
  brothersMarried: number | null;
  brothersUnmarried: number | null;
  sistersMarried: number | null;
  sistersUnmarried: number | null;
  familyDetails: string | null;
  familyFinancialStatus: string | null;

  heightCm: number | null;
  weightKg: number | null;
  bodyType: string | null;
  complexion: Complexion | null;
  bloodGroup: BloodGroup | null;
  physicalDetails: string | null;

  religiousValue: string | null;
  familyValues: FamilyValues | null;
  diet: Diet | null;
  smoke: Smoke | null;
  hobbies: string | null;

  motherTongue: string | null;
  englishComfort: string | null;
  residencyStatus: string | null;
  growUpIn: string | null;
  partnerPreferences: string | null;
}

export interface MyProfile extends LocationFields, ProfileBioData {
  id: string;
  publicId: string | null;
  name: string;
  relativeName: string | null;
  relativePhone: string | null;
  /** Only ever returned for your own profile — never on someone else's card. */
  zip: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  photos: Photo[];
  isVerified: boolean;
  completionPercent: number;
  missingFields: string[];
  spotlightUntil: string | null;
}

export interface BrowseCard extends LocationFields {
  id: string;
  name: string;
  age: number | null;
  profession: string | null;
  education: string | null;
  religion: string | null;
  heightCm: number | null;
  photoUrl: string | null;
  distanceKm: number | null;
  isVerified: boolean;
}

export interface LikedYouCard extends LocationFields {
  userId: string;
  name: string;
  superliked: boolean;
  unlocked: boolean;
  photoUrl: string | null;
  likedAt: string;
  isVerified: boolean;
}

export interface MyLikeCard extends LocationFields {
  userId: string;
  name: string;
  distanceKm: number | null;
  photoUrl: string | null;
  superliked: boolean;
  likedAt: string;
  isVerified: boolean;
}

/**
 * A profile the viewer has not paid to unlock: the full bio-data, no identity.
 * `name`, `phone`, `email`, the addresses and the district are absent from the
 * payload entirely rather than nulled, so reading them is a type error.
 */
export interface LockedProfile extends CoarseLocationFields, ProfileBioData {
  userId: string;
  publicId: string | null;
  age: number | null;
  gender: Gender;
  /** Blurred, since the viewer has not unlocked this profile. */
  photos: string[];
  isVerified: boolean;
  locked: true;
}

/** Everything above, plus the identity and contact details unlocking pays for. */
export interface UnlockedProfile extends Omit<LockedProfile, 'locked'>, LocationFields {
  name: string;
  relativeName: string | null;
  relativePhone: string | null;
  phone: string | null;
  email: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  /** Part of the address the unlock buys — absent from every locked payload. */
  zip: string | null;
  locked: false;
}

/** What `GET /profile-views/:id` returns — always an unlocked profile. */
export type ProfileDetail = UnlockedProfile;

/** What `GET /profile-views/:id/preview` returns — the paywall teaser. */
export interface ProfilePreview extends LockedProfile {
  photoUrl: string | null;
  /** Named up front, same as the public directory, rather than hidden behind the paywall. */
  name: string;
}

/** One row of `GET /profiles/public`; locked or unlocked per viewer. */
export type PublicProfileCard = (LockedProfile | UnlockedProfile) & {
  photoUrl: string | null;
  isSpotlighted: boolean;
  /**
   * Unlike every other locked view, the directory shows the real name even
   * before unlock — so a still-locked row carries it too, not just an
   * unlocked one.
   */
  name?: string;
};

export interface PublicProfilesPage {
  items: PublicProfileCard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WalletInfo {
  balance: number;
  profileViewCost: number;
  minTopupAmount: number;
  spotlightCost: number;
  spotlightDurationHours: number;
  bkashMerchantNumber: string;
}

export interface PublicStats {
  statVerifiedMembers: string;
  statMatchesMade: string;
  statDistrictsCovered: string;
  statAverageRating: string;
  statProfilesReviewedPercent: string;
  whatsappNumber: string | null;
}

export interface ConversationOtherUser {
  id: string;
  name: string | null;
  photoUrl: string | null;
  isVerified: boolean;
  district: string | null;
  city: string | null;
  state: string | null;
}

export interface Conversation {
  id: string;
  otherUser: ConversationOtherUser | null;
  lastMessage: { preview: string | null; senderId: string; createdAt: string } | null;
  lastMessageAt: string | null;
  unreadCount: number;
  blockedByMe: boolean;
  blockedByOther: boolean;
}

export type MessageType = 'text' | 'image';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  body: string | null;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  userId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'view_unlock' | 'refund' | 'admin_adjust';
  amount: number;
  balanceAfter: number;
  provider: 'bkash' | 'nagad' | null;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}
