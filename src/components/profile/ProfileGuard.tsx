'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMyProfile } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const EXEMPT_PATHS = ['/edit-profile'];

export function ProfileGuard({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isLoading, isError } = useMyProfile();

  const isExempt = EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const needsProfile = !isLoading && !isError && !profile && !isExempt;

  useEffect(() => {
    if (needsProfile) router.replace('/edit-profile');
  }, [needsProfile, router]);

  if (isLoading || needsProfile) {
    return <div className="pt-24 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>;
  }

  return <>{children}</>;
}
