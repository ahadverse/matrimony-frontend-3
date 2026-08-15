'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, BadgeCheck, Lock, MapPin, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/motion/FadeIn';
import { ProfileBioSections } from '@/components/profile/ProfileBioSections';
import {
  useConversations,
  useProfileDetail,
  useProfilePreview,
  useStartConversation,
  useUnlockProfile,
  useWallet,
} from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ApiError, resolveUploadUrl } from '@/lib/api-client';
import { formatLocationFull } from '@/lib/geo';
import type { LockedProfile, UnlockedProfile } from '@/lib/types';

export default function ProfileDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { t } = useLanguage();
  const { data: profile, isLoading, isError, error } = useProfileDetail(userId);

  if (isLoading) {
    return <div className="pt-24 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>;
  }

  // The backend answers 403 for a profile the viewer hasn't paid to unlock —
  // the one failure worth offering a way out of. Anything else (404, network)
  // has no action attached to it.
  if (error instanceof ApiError && error.status === 403) {
    return <LockedProfileView userId={userId} />;
  }

  if (isError || !profile) {
    return (
      <div className="pt-24 text-center text-sm text-[var(--color-text-muted)]">
        {t('profileDetail.lockedTitle')}
      </div>
    );
  }

  return <UnlockedProfileView profile={profile} />;
}

function UnlockedProfileView({ profile }: { profile: UnlockedProfile }) {
  const { t } = useLanguage();

  return (
    <ProfileLayout
      profile={profile}
      heading={profile.name}
      photos={profile.photos}
      badge={<Badge tone="success">{t('profiles.unlocked')}</Badge>}
      actions={<MessageAction userId={profile.userId} />}
    />
  );
}

/**
 * A profile the viewer has not paid for. It renders the same full bio-data as
 * the unlocked view — that is what a member judges a match on — headed by the
 * public profile id instead of a name, and with the unlock CTA in place of the
 * Message button. The withheld fields aren't in the payload at all, so there is
 * nothing here to hide in the markup.
 */
function LockedProfileView({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: preview, isLoading } = useProfilePreview(userId);
  const { data: wallet } = useWallet();
  const unlockMutation = useUnlockProfile();

  function unlock() {
    unlockMutation.mutate(userId, {
      // On success useUnlockProfile writes the freshly unlocked detail into
      // ['profile-detail', userId], which flips the parent query out of its
      // error state and renders the real profile in place of this view.
      onError: (error) => {
        if (error instanceof ApiError && error.status === 400) {
          toast.error(t('likesYou.insufficientBalance'));
          router.push('/checkout');
        } else {
          toast.error(t('profileDetail.unlockError'));
        }
      },
    });
  }

  if (isLoading) {
    return <div className="pt-24 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>;
  }
  if (!preview) {
    return (
      <div className="pt-24 text-center text-sm text-[var(--color-text-muted)]">
        {t('profileDetail.lockedTitle')}
      </div>
    );
  }

  const cost = wallet?.profileViewCost ?? 0;

  return (
    <ProfileLayout
      profile={preview}
      heading={preview.publicId ?? t('profileDetail.lockedHiddenName')}
      photos={preview.photos}
      blurPhotos
      badge={
        <Badge tone="warning">
          <Lock size={11} /> {t('profileDetail.lockedTitle')}
        </Badge>
      }
      actions={
        <div className="mt-4 rounded-xl bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">{t('profileDetail.lockedNotice')}</p>
          <p className="mt-3 text-sm font-medium text-[var(--color-primary-accent)]">
            {t('likesYou.unlockModalBody', { cost: `${t('common.taka')}${cost}` })}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-faint)]">
            {t('likesYou.walletBalance', { balance: `${t('common.taka')}${wallet?.balance ?? 0}` })}
          </p>
          <Button variant="gold" className="mt-3 w-full" onClick={unlock} loading={unlockMutation.isPending}>
            <Lock size={16} /> {t('profileDetail.unlockCta')}
          </Button>
        </div>
      }
    />
  );
}

/** The shared frame: photo rail, header, actions, then the bio-data sections. */
function ProfileLayout({
  profile,
  heading,
  photos,
  blurPhotos,
  badge,
  actions,
}: {
  profile: LockedProfile | UnlockedProfile;
  heading: string;
  photos: string[];
  blurPhotos?: boolean;
  badge: React.ReactNode;
  actions: React.ReactNode;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [activePhoto, setActivePhoto] = useState(0);
  const gallery = photos.length > 0 ? photos : [null];

  return (
    <FadeIn className="mx-auto max-w-5xl">
      <button
        onClick={() => router.back()}
        className="mb-3 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <div className="grid gap-5 sm:grid-cols-[320px_1fr] sm:items-start">
        <div className="flex flex-col gap-5 sm:sticky sm:top-24">
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full bg-[var(--color-surface)]">
              <ProfilePhoto photoUrl={gallery[activePhoto] ?? gallery[0]} name={heading} />
              {blurPhotos && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--color-scrim)]">
                  <Lock size={22} className="text-[var(--color-on-primary)]" />
                  <span className="text-xs font-semibold text-[var(--color-on-primary)]">
                    {t('profiles.premiumOverlay')}
                  </span>
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {gallery.map((url, index) => (
                  <button
                    key={url ?? index}
                    onClick={() => setActivePhoto(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                      index === activePhoto ? 'border-[var(--color-primary)]' : 'border-transparent'
                    }`}
                  >
                    <ProfilePhoto photoUrl={url} name={heading} fallbackTextClassName="text-xl" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <div className="hidden sm:block">{actions}</div>
        </div>

        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl text-[var(--color-text)]">{heading}</h1>
            {profile.isVerified && (
              <BadgeCheck size={20} className="shrink-0 text-[var(--color-verified)]" aria-label={t('common.verified')} />
            )}
            {profile.age && <span className="text-lg text-[var(--color-text-muted)]">{profile.age}</span>}
            {badge}
          </div>

          {profile.publicId && (
            <p className="mt-1 text-xs text-[var(--color-text-faint)]">
              {t('profileDetail.profileId')}: {profile.publicId}
            </p>
          )}

          <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-faint)]">
            <MapPin size={14} />
            {formatLocationFull(profile)}
          </div>

          <div className="sm:hidden">{actions}</div>

          <hr className="rule-gold my-4" />

          <ProfileBioSections profile={profile} />
        </Card>
      </div>
    </FadeIn>
  );
}

/**
 * Message CTA for an unlocked profile. Unlocking is the only gate — this has
 * nothing to do with swipes/matches — so it either jumps to the existing
 * thread or opens a fresh one via profile-views/:targetId/conversation.
 */
function MessageAction({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: conversations } = useConversations();
  const startConversation = useStartConversation();

  const conversationId = conversations?.find((c) => c.otherUser?.id === userId)?.id;

  function openConversation() {
    if (conversationId) {
      router.push(`/inbox/${conversationId}`);
      return;
    }
    startConversation.mutate(userId, {
      onSuccess: (data) => router.push(`/inbox/${data.conversationId}`),
      onError: (error) =>
        toast.error(error instanceof ApiError ? String(error.message) : t('profileDetail.messageError')),
    });
  }

  return (
    <Button className="mt-4 w-full" onClick={openConversation} loading={startConversation.isPending}>
      <MessageCircle size={16} /> {t('interests.message')}
    </Button>
  );
}

function ProfilePhoto({
  photoUrl,
  name,
  fallbackTextClassName = 'text-6xl',
}: {
  photoUrl: string | null;
  name: string;
  fallbackTextClassName?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const resolved = resolveUploadUrl(photoUrl);

  if (!resolved || imgError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center font-display text-[var(--color-text-faint)] ${fallbackTextClassName}`}
      >
        {name.charAt(0)}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolved} alt={name} className="h-full w-full object-cover" onError={() => setImgError(true)} />;
}
