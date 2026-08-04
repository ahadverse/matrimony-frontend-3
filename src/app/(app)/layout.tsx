import { Heart } from 'lucide-react';
import { AuthTopNav } from '@/components/nav/AuthTopNav';
import { AppMain } from '@/components/nav/AppMain';
import { BottomTabBar } from '@/components/nav/BottomTabBar';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { ChatProvider } from '@/lib/chat/ChatProvider';
import { ProfileGuard } from '@/components/profile/ProfileGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex min-h-dvh flex-col">
        <Heart
          strokeWidth={1.25}
          className="fixed -right-12 top-16 -z-10 h-36 w-36 text-[var(--color-primary)]/15 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
          aria-hidden
        />
        <Heart
          strokeWidth={1.25}
          className="fixed -left-12 bottom-10 -z-10 h-36 w-36 rotate-12 text-[var(--color-primary-light)]/15 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
          aria-hidden
        />
        <AuthTopNav />
        {/* Bottom padding reserves room for the fixed mobile tab bar so page
            content never sits underneath it. */}
        <AppMain>
          <ProfileGuard>{children}</ProfileGuard>
        </AppMain>
        {/* A footer stacked above the fixed tab bar is dead weight on mobile;
            it stays on marketing routes at every breakpoint. */}
        <SiteFooter className="hidden lg:block" />
        <BottomTabBar />
      </div>
    </ChatProvider>
  );
}
