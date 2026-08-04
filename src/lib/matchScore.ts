import type { MyProfile } from './types';
import type { BrowseFeedCard } from './queries';

/**
 * Client-side compatibility heuristic — the backend has no matching-score
 * concept, so this derives a stable, data-driven percentage from overlap
 * with the viewer's own profile rather than a random number.
 */
export function computeMatchScore(me: MyProfile | null | undefined, candidate: BrowseFeedCard): number {
  if (!me) return 60;
  let score = 40;
  if (me.district && me.district === candidate.district) score += 20;
  if (me.religion && candidate.religion && me.religion === candidate.religion) score += 15;
  if (me.education && candidate.education && me.education === candidate.education) score += 10;
  if (candidate.isVerified) score += 5;
  if (candidate.maritalStatus && me.maritalStatus === candidate.maritalStatus) score += 10;
  return Math.max(35, Math.min(99, score));
}
