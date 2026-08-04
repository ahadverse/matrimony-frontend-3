import Link from 'next/link';
import { BadgeCheck, Lock, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { Card } from '@/components/ui/Card';
import { resolveUploadUrl } from '@/lib/api-client';

interface ProfileCardProps {
  userId: string;
  name: string;
  district: string;
  subDistrict?: string | null;
  age?: number | null;
  photoUrl?: string | null;
  isVerified?: boolean;
  isSpotlighted?: boolean;
  locked?: boolean;
  meta?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function ProfileCard({
  userId,
  name,
  district,
  subDistrict,
  age,
  photoUrl,
  isVerified,
  isSpotlighted,
  locked,
  meta,
  footer,
  className,
}: ProfileCardProps) {
  const resolvedPhoto = resolveUploadUrl(photoUrl);

  return (
    <Card className={clsx('flex flex-col overflow-hidden p-0', className)}>
      <Link href={`/profile/${userId}`} className="relative block aspect-[4/5] w-full overflow-hidden bg-[var(--color-surface)]">
        {resolvedPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedPhoto}
            alt={name}
            className={clsx('h-full w-full object-cover', locked && 'blur-md')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-text-faint)]">{name[0]}</div>
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-scrim)]">
            <Lock className="text-[var(--color-on-primary)]" size={22} />
          </div>
        )}
        {isSpotlighted && (
          <span className="gradient-gold absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-[var(--color-on-gold)]">
            <Sparkles size={10} /> Spotlight
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link
          href={`/profile/${userId}`}
          className="flex items-center gap-1 truncate font-display text-sm text-[var(--color-text)] hover:underline"
        >
          <span className="truncate">
            {locked ? name : name}
            {age ? `, ${age}` : ''}
          </span>
          {isVerified && <BadgeCheck size={14} className="shrink-0 text-[var(--color-verified)]" />}
        </Link>
        <p className="text-xs text-[var(--color-text-faint)]">
          {district}
          {subDistrict ? ` · ${subDistrict}` : ''}
        </p>
        {meta && <p className="text-xs text-[var(--color-text-muted)]">{meta}</p>}
        {footer && <div className="mt-2">{footer}</div>}
      </div>
    </Card>
  );
}
