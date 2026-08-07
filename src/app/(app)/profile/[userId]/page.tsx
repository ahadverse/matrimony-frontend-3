'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Briefcase,
  BadgeCheck,
  Building2,
  Droplet,
  GraduationCap,
  Globe2,
  Heart,
  Home,
  Languages,
  Lock,
  MapPin,
  MessageCircle,
  PersonStanding,
  Ruler,
  Users,
  Wallet,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/motion/FadeIn';
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
import { formatHeight } from '@/lib/height';

export default function ProfileDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const { data: profile, isLoading, isError, error } = useProfileDetail(userId);
  const [activePhoto, setActivePhoto] = useState(0);

  if (isLoading) {
    return <div className="pt-24 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>;
  }

  // The backend answers 403 for a profile the viewer hasn't paid to unlock —
  // the one failure worth offering a way out of. Anything else (404, network)
  // has no action attached to it.
  if (error instanceof ApiError && error.status === 403) {
    return <LockedProfile userId={userId} />;
  }

  if (isError || !profile) {
    return (
      <div className="pt-24 text-center text-sm text-[var(--color-text-muted)]">
        {t('profileDetail.lockedTitle')}
      </div>
    );
  }

  const details = [
    { icon: Heart, label: t('profileDetail.maritalStatus'), value: t(`profileDetail.${profile.maritalStatus}`) },
    {
      icon: Users,
      label: t('auth.register.profileCreatedBy'),
      value: profile.profileCreatedBy
        ? t(`auth.register.profileCreatedBy${profile.profileCreatedBy.charAt(0).toUpperCase()}${profile.profileCreatedBy.slice(1)}`)
        : null,
    },
    { icon: Briefcase, label: t('profileDetail.profession'), value: profile.profession },
    { icon: GraduationCap, label: t('profileDetail.education'), value: profile.education },
    { icon: Heart, label: t('profileDetail.religion'), value: profile.religion },
    { icon: Ruler, label: t('profileDetail.height'), value: formatHeight(profile.heightCm) },
    { icon: Users, label: t('profileDetail.fatherOccupation'), value: profile.fatherOccupation },
    { icon: Users, label: t('profileDetail.motherOccupation'), value: profile.motherOccupation },
    { icon: Users, label: t('profileDetail.siblings'), value: profile.siblingsCount != null ? String(profile.siblingsCount) : null },
    { icon: Users, label: t('browse.gateMissing.numberOfSisters'), value: profile.numberOfSisters != null ? String(profile.numberOfSisters) : null },
    { icon: Users, label: t('browse.gateMissing.numberOfBrothers'), value: profile.numberOfBrothers != null ? String(profile.numberOfBrothers) : null },
    { icon: Droplet, label: t('profileDetail.bloodGroup'), value: profile.bloodGroup },
    {
      icon: Droplet,
      label: t('profileDetail.complexion'),
      value: profile.complexion
        ? t(`profileDetail.complexion${profile.complexion.charAt(0).toUpperCase()}${profile.complexion.slice(1)}`)
        : null,
    },
    { icon: PersonStanding, label: t('editProfile.bodyType'), value: profile.bodyType },
    { icon: Wallet, label: t('profileDetail.monthlyIncome'), value: profile.monthlyIncome ? `${profile.monthlyIncome}` : null },
    { icon: Building2, label: t('profileDetail.company'), value: profile.companyName },
    { icon: Wallet, label: t('editProfile.familyFinancialStatus'), value: profile.familyFinancialStatus },
    { icon: Languages, label: t('editProfile.motherTongue'), value: profile.motherTongue },
    { icon: Languages, label: t('editProfile.englishComfort'), value: profile.englishComfort },
    { icon: Globe2, label: t('editProfile.residencyStatus'), value: profile.residencyStatus },
    { icon: Home, label: t('editProfile.growUpIn'), value: profile.growUpIn },
    { icon: GraduationCap, label: t('editProfile.collegeUniversity'), value: profile.collegeUniversity },
  ].filter((d) => d.value);

  const photos = profile.photos.length > 0 ? profile.photos : [null];

  return (
    <FadeIn className="mx-auto max-w-4xl">
      <button
        onClick={() => router.back()}
        className="mb-3 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <div className="grid gap-5 sm:grid-cols-[320px_1fr] sm:items-start">
        <Card className="overflow-hidden">
          <div className="aspect-square w-full bg-[var(--color-surface)]">
            <ProfilePhoto photoUrl={photos[activePhoto] ?? photos[0] ?? null} name={profile.name} />
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {photos.map((url, index) => (
                <button
                  key={url ?? index}
                  onClick={() => setActivePhoto(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    index === activePhoto ? 'border-[var(--color-primary)]' : 'border-transparent'
                  }`}
                >
                  <ProfilePhoto photoUrl={url} name={profile.name} fallbackTextClassName="text-xl" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h1 className="flex items-center gap-1.5 font-display text-2xl text-[var(--color-text)]">
            {profile.name}
            {profile.isVerified && (
              <BadgeCheck size={20} className="shrink-0 text-[var(--color-verified)]" aria-label={t('common.verified')} />
            )}
            {profile.age && <span className="ml-1 text-lg text-[var(--color-text-muted)]">{profile.age}</span>}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-faint)]">
            <MapPin size={14} />
            {profile.subDistrict ? `${profile.subDistrict}, ${profile.district}` : profile.district}
          </div>

          <ProfileActions userId={userId} />

          <hr className="rule-gold mt-4" />

          {profile.bio && (
            <div className="mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                {t('profileDetail.about')}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{profile.bio}</p>
            </div>
          )}

          {details.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {details.map(({ icon: Icon, label, value }, index) => (
                <div key={`${label}-${index}`} className="rounded-xl bg-[var(--color-surface)] p-3">
                  <Icon size={16} className="text-[var(--color-primary-light)]" />
                  <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">{label}</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{value}</p>
                </div>
              ))}
            </div>
          )}

          {(profile.presentAddress || profile.permanentAddress) && (
            <div className="mt-5 flex flex-col gap-3">
              {profile.presentAddress && (
                <div>
                  <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                    <Home size={12} /> {t('profileDetail.presentAddress')}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{profile.presentAddress}</p>
                </div>
              )}
              {profile.permanentAddress && (
                <div>
                  <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                    <Home size={12} /> {t('profileDetail.permanentAddress')}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{profile.permanentAddress}</p>
                </div>
              )}
            </div>
          )}

          {profile.hobbies && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                {t('editProfile.hobbies')}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{profile.hobbies}</p>
            </div>
          )}

          {profile.partnerPreferences && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                {t('editProfile.partnerPreferences')}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{profile.partnerPreferences}</p>
            </div>
          )}
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
function ProfileActions({ userId }: { userId: string }) {
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

function LockedProfile({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: preview, isLoading } = useProfilePreview(userId);
  const { data: wallet } = useWallet();
  const unlockMutation = useUnlockProfile();

  function unlock() {
    unlockMutation.mutate(userId, {
      // On success useUnlockProfile writes the freshly unlocked detail into
      // ['profile-detail', userId], which flips the parent query out of its
      // error state and renders the real profile in place of this notice.
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

  const cost = wallet?.profileViewCost ?? 0;

  return (
    <FadeIn className="mx-auto max-w-md">
      <button
        onClick={() => router.back()}
        className="mb-3 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <Card className="overflow-hidden">
        <div className="relative aspect-square w-full bg-[var(--color-surface)]">
          <ProfilePhoto photoUrl={preview?.photoUrl ?? null} name={preview?.name ?? '?'} />
          <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <Lock size={16} className="text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center p-5 text-center">
          {preview && (
            <>
              <h1 className="flex items-center gap-1.5 font-display text-xl text-[var(--color-text)]">
                {preview.name}
                {preview.isVerified && (
                  <BadgeCheck size={18} className="shrink-0 text-[var(--color-verified)]" aria-label={t('common.verified')} />
                )}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-faint)]">
                <MapPin size={14} />
                {preview.subDistrict ? `${preview.subDistrict}, ${preview.district}` : preview.district}
              </div>
            </>
          )}

          <h2 className="mt-3 font-display text-lg text-[var(--color-text)]">{t('profileDetail.lockedTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('profileDetail.lockedBody')}</p>

          <p className="mt-4 w-full rounded-xl bg-[var(--color-surface)] p-3 text-sm font-medium text-[var(--color-primary-accent)]">
            {t('likesYou.unlockModalBody', { cost: `${t('common.taka')}${cost}` })}
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-faint)]">
            {t('likesYou.walletBalance', { balance: `${t('common.taka')}${wallet?.balance ?? 0}` })}
          </p>
          <Button variant="primary" className="mt-4 w-full" onClick={unlock} loading={unlockMutation.isPending}>
            <Lock size={16} /> {t('profileDetail.unlockCta')}
          </Button>
        </div>
      </Card>
    </FadeIn>
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
