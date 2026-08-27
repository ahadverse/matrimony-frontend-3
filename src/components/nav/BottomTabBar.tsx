'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, HeartHandshake, MessageCircle, Users, UserRound } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useLikesYou, useUnreadCount } from '@/lib/queries';
import { useIsSignedIn } from '@/lib/auth-token';

const tabs = [
  { href: '/profiles', icon: Users, labelKey: 'nav.profiles' },
  { href: '/browse', icon: Compass, labelKey: 'nav.discover' },
  { href: '/interests', icon: HeartHandshake, labelKey: 'nav.interests' },
  { href: '/inbox', icon: MessageCircle, labelKey: 'nav.inbox' },
  { href: '/dashboard', icon: UserRound, labelKey: 'nav.tabProfile' },
] as const;

export function BottomTabBar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const signedIn = useIsSignedIn();
  const { data: likesYou } = useLikesYou(signedIn);
  const { data: unread } = useUnreadCount(signedIn);

  // A chat thread wants the full screen on mobile — the tab bar would eat
  // into the space the composer needs.
  if (pathname.startsWith('/inbox/')) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={t('nav.dashboard')}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const badge =
            href === '/interests' ? likesYou?.length : href === '/inbox' ? unread?.count : undefined;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium"
              aria-current={active ? 'page' : undefined}
            >
              <span className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={active ? 'text-[var(--color-primary-accent)]' : 'text-[var(--color-text-faint)]'}
                />
                {!!badge && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-bold text-[var(--color-on-primary)]">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className={active ? 'text-[var(--color-primary-accent)]' : 'text-[var(--color-text-faint)]'}>
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
