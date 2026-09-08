import { ProfilesPageSkeleton } from '@/components/profile/ProfilesPageSkeleton';

/**
 * Shown the moment a reader navigates to /profiles, while Next streams the
 * route in. Without it the previous page stays frozen on screen until the new
 * one is ready, which reads as an unresponsive link.
 *
 * Same component as the page's own Suspense fallback, so the handover between
 * the two stages is seamless.
 */
export default function Loading() {
  return <ProfilesPageSkeleton />;
}
