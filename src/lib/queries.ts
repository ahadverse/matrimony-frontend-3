'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api-client';
import type {
  BrowseCard,
  ChatMessage,
  Conversation,
  CurrentUser,
  District,
  Gender,
  LikedYouCard,
  MaritalStatus,
  MyLikeCard,
  MyProfile,
  MyVerification,
  ProfileDetail,
  ProfilePreview,
  PublicStats,
  WalletInfo,
  WalletTransaction,
} from './types';

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<CurrentUser>('users/me'),
    enabled,
    retry: false,
  });
}

export function useUpdateBasics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { gender?: Gender; dob?: string }) => api.patch('users/me/basics', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coords: { latitude: number; longitude: number }) => api.patch('users/me/location', coords),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export interface BrowseFilters {
  district?: string;
  subDistrict?: string;
  education?: string;
  profession?: string;
  religion?: string;
  maritalStatus?: string;
}

export function useBrowseFeed(filters: BrowseFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ['browse', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.district) params.set('district', filters.district);
      if (filters.subDistrict) params.set('subDistrict', filters.subDistrict);
      if (filters.education) params.set('education', filters.education);
      if (filters.profession) params.set('profession', filters.profession);
      if (filters.religion) params.set('religion', filters.religion);
      if (filters.maritalStatus) params.set('maritalStatus', filters.maritalStatus);
      const qs = params.toString();
      // No page/pageSize: the backend then returns a bare, already-shuffled
      // array (capped server-side) with already-swiped ids excluded, which is
      // exactly what the swipe deck wants — refetch() doubles as "load more".
      return api.get<BrowseCard[]>(`swipes/browse${qs ? `?${qs}` : ''}`);
    },
    enabled,
    staleTime: 30_000,
  });
}

export interface BrowseFeedCard extends BrowseCard {
  education: string | null;
  religion: string | null;
  maritalStatus: MaritalStatus;
  isSpotlighted: boolean;
}

export interface BrowseFeedPage {
  items: BrowseFeedCard[];
  total: number;
  page: number;
  pageSize: number;
}

const BROWSE_PAGE_SIZE = 12;

export function useBrowseFeedInfinite(filters: BrowseFilters = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['browse-infinite', filters],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), pageSize: String(BROWSE_PAGE_SIZE) });
      if (filters.district) params.set('district', filters.district);
      if (filters.subDistrict) params.set('subDistrict', filters.subDistrict);
      if (filters.education) params.set('education', filters.education);
      if (filters.profession) params.set('profession', filters.profession);
      if (filters.religion) params.set('religion', filters.religion);
      if (filters.maritalStatus) params.set('maritalStatus', filters.maritalStatus);
      return api.get<BrowseFeedPage>(`swipes/browse?${params.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: 30_000,
  });
}

export interface FilteredCard {
  userId: string;
  name: string;
  district: string;
  subDistrict: string | null;
  photoUrl: string | null;
  isVerified: boolean;
  filteredAt: string;
}

export function useFilteredProfiles() {
  return useQuery({
    queryKey: ['filtered'],
    queryFn: () => api.get<FilteredCard[]>('swipes/filtered'),
  });
}

export interface ShortlistCard {
  userId: string;
  name: string;
  district: string;
  subDistrict: string | null;
  photoUrl: string | null;
  isVerified: boolean;
  shortlistedAt: string;
}

export function useShortlist() {
  return useQuery({
    queryKey: ['shortlist'],
    queryFn: () => api.get<ShortlistCard[]>('shortlists'),
  });
}

export function useAddShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => api.post<{ success: true }>(`shortlists/${targetId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shortlist'] }),
  });
}

export function useRemoveShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => api.delete<{ success: true }>(`shortlists/${targetId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shortlist'] }),
  });
}

export interface ProfileViewer {
  userId: string;
  name: string;
  district: string;
  photoUrl: string | null;
  viewedAt: string;
}

export function useProfileViews() {
  return useQuery({
    queryKey: ['profile-views-me'],
    queryFn: () => api.get<{ count: number; viewers: ProfileViewer[] }>('profile-views/me'),
  });
}

export interface ActiveUser {
  userId: string;
  name: string;
  age: number | null;
  district: string;
  lastActiveAt: string;
}

export function useLiveActivity() {
  return useQuery({
    queryKey: ['users-active'],
    queryFn: () => api.get<ActiveUser[]>('users/active'),
    staleTime: 60_000,
  });
}

export function useActivateSpotlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<MyProfile>('profiles/me/spotlight'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useDistricts() {
  return useQuery({
    queryKey: ['geo', 'districts'],
    queryFn: () => api.get<District[]>('geo/districts'),
    staleTime: Infinity,
  });
}

export function useUpazilas(district: string | null | undefined) {
  return useQuery({
    queryKey: ['geo', 'upazilas', district],
    queryFn: () => api.get<string[]>(`geo/districts/${encodeURIComponent(district!)}/upazilas`),
    enabled: !!district,
    staleTime: Infinity,
  });
}

interface SwipeResult {
  success: boolean;
  matched: boolean;
  conversationId?: string;
}

export function useSwipeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetId, action }: { targetId: string; action: 'like' | 'reject' | 'superlike' }) =>
      api.post<SwipeResult>('swipes', { targetId, action }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-likes'] });
      if (data.matched) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });
}

export function useLikesYou() {
  return useQuery({
    queryKey: ['likes-you'],
    queryFn: () => api.get<LikedYouCard[]>('swipes/likes-you'),
  });
}

export function useMyLikes() {
  return useQuery({
    queryKey: ['my-likes'],
    queryFn: () => api.get<MyLikeCard[]>('swipes/my-likes'),
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get<PublicStats>('settings/public'),
    staleTime: 5 * 60_000,
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get<WalletInfo>('wallet'),
  });
}

interface TransactionsPage {
  items: WalletTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export function useWalletTransactions(params: { pageSize?: number; type?: WalletTransaction['type'] } = {}) {
  const { pageSize = 20, type } = params;
  return useQuery({
    queryKey: ['wallet-transactions', pageSize, type],
    queryFn: () => {
      const query = new URLSearchParams({ page: '1', pageSize: String(pageSize) });
      if (type) query.set('type', type);
      return api.get<TransactionsPage>(`wallet/transactions?${query.toString()}`);
    },
  });
}

const HISTORY_PAGE_SIZE = 20;

export function useWalletTransactionsInfinite(type?: WalletTransaction['type']) {
  return useInfiniteQuery({
    queryKey: ['wallet-transactions-infinite', type],
    queryFn: ({ pageParam }) => {
      const query = new URLSearchParams({ page: String(pageParam), pageSize: String(HISTORY_PAGE_SIZE) });
      if (type) query.set('type', type);
      return api.get<TransactionsPage>(`wallet/transactions?${query.toString()}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined,
  });
}

export function useProfileDetail(targetId: string | null) {
  return useQuery({
    queryKey: ['profile-detail', targetId],
    queryFn: () => api.get<ProfileDetail>(`profile-views/${targetId}`),
    enabled: !!targetId,
    retry: false,
  });
}

// Backs the locked-profile teaser: unlike useProfileDetail this has no unlock
// gate, so it resolves for any target and always returns the blurred photo.
export function useProfilePreview(targetId: string | null) {
  return useQuery({
    queryKey: ['profile-preview', targetId],
    queryFn: () => api.get<ProfilePreview>(`profile-views/${targetId}/preview`),
    enabled: !!targetId,
  });
}

export function useUnlockProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => api.post<ProfileDetail>(`profile-views/${targetId}/unlock`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['likes-you'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.setQueryData(['profile-detail', data.userId], data);
    },
  });
}

// The only requirement is a prior unlock — no swipes/likes involved — so this
// opens (or reuses) a conversation directly from an unlocked profile.
export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => api.post<{ conversationId: string }>(`profile-views/${targetId}/conversation`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get<MyProfile | null>('profiles/me'),
  });
}

export function useUpsertMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MyProfile>) => api.put<MyProfile>('profiles/me', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('profiles/me/photos', formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => api.delete(`profiles/me/photos/${photoId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  });
}

export function useMyVerification() {
  return useQuery({
    queryKey: ['my-verification'],
    queryFn: () => api.get<MyVerification | null>('verification/me'),
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nidNumber, selfie }: { nidNumber: string; selfie: File }) => {
      const formData = new FormData();
      formData.append('nidNumber', nidNumber);
      formData.append('selfie', selfie);
      return api.post<MyVerification>('verification/me', formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-verification'] }),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<Conversation[]>('conversations'),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get<{ count: number }>('conversations/unread-count'),
    staleTime: 15_000,
  });
}

interface MessagesPage {
  items: ChatMessage[];
  total: number;
  page: number;
  pageSize: number;
}

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) =>
      api.get<MessagesPage>(`conversations/${conversationId}/messages?page=${pageParam}&pageSize=50`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined,
    enabled: !!conversationId,
  });
}

export function useSendImageMessage(conversationId: string) {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post<ChatMessage>(`conversations/${conversationId}/photos`, formData);
    },
  });
}
