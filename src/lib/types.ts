export type Gender = 'male' | 'female';
export type MaritalStatus = 'single' | 'divorced' | 'widowed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Complexion = 'fair' | 'medium' | 'dark';
export type ProfileCreatedBy = 'self' | 'parents' | 'brother' | 'sister' | 'relative';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

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
  phone: string;
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
  user: Pick<CurrentUser, 'id' | 'phone' | 'gender' | 'role' | 'status' | 'walletBalance'>;
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
export interface LocationFields {
  district: string | null;
  subDistrict: string | null;
  country: string | null;
  countryCode: string | null;
  state: string | null;
  city: string | null;
}

export interface Photo {
  id: string;
  url: string;
  blurredUrl: string;
  isPrimary: boolean;
  order: number;
}

export interface MyProfile extends LocationFields {
  id: string;
  name: string;
  /** Only ever returned for your own profile — never on someone else's card. */
  zip: string | null;
  bio: string | null;
  profession: string | null;
  education: string | null;
  religion: string | null;
  heightCm: number | null;
  maritalStatus: MaritalStatus;
  profileCreatedBy: ProfileCreatedBy | null;
  fatherOccupation: string | null;
  motherOccupation: string | null;
  siblingsCount: number | null;
  bloodGroup: BloodGroup | null;
  complexion: Complexion | null;
  monthlyIncome: number | null;
  companyName: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  photos: Photo[];
  isVerified: boolean;
  completionPercent: number;
  missingFields: string[];
  motherTongue: string | null;
  englishComfort: string | null;
  residencyStatus: string | null;
  growUpIn: string | null;
  collegeUniversity: string | null;
  partnerPreferences: string | null;
  hobbies: string | null;
  familyFinancialStatus: string | null;
  bodyType: string | null;
  numberOfSisters: number | null;
  numberOfBrothers: number | null;
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

export interface ProfilePreview extends LocationFields {
  userId: string;
  name: string;
  photoUrl: string | null;
  isVerified: boolean;
}

export interface ProfileDetail extends LocationFields {
  userId: string;
  name: string;
  age: number | null;
  bio: string | null;
  profession: string | null;
  education: string | null;
  religion: string | null;
  heightCm: number | null;
  maritalStatus: MaritalStatus;
  profileCreatedBy: ProfileCreatedBy | null;
  fatherOccupation: string | null;
  motherOccupation: string | null;
  siblingsCount: number | null;
  bloodGroup: BloodGroup | null;
  complexion: Complexion | null;
  monthlyIncome: number | null;
  companyName: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  motherTongue: string | null;
  englishComfort: string | null;
  residencyStatus: string | null;
  growUpIn: string | null;
  collegeUniversity: string | null;
  partnerPreferences: string | null;
  hobbies: string | null;
  familyFinancialStatus: string | null;
  bodyType: string | null;
  numberOfSisters: number | null;
  numberOfBrothers: number | null;
  photos: string[];
  isVerified: boolean;
}

export interface WalletInfo {
  balance: number;
  profileViewCost: number;
  minTopupAmount: number;
  spotlightCost: number;
  spotlightDurationHours: number;
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

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'view_unlock' | 'refund' | 'admin_adjust';
  amount: number;
  balanceAfter: number;
  provider: 'bkash' | 'nagad' | null;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}
