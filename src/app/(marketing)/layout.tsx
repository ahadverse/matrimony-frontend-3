import { TopNav } from '@/components/nav/TopNav';
import { AnnouncementStrip } from '@/components/ui/AnnouncementStrip';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { WhatsAppFloatButton } from '@/components/ui/WhatsAppFloatButton';
import { BackToTopButton } from '@/components/ui/BackToTopButton';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav />
      <AnnouncementStrip />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloatButton />
      <BackToTopButton />
    </div>
  );
}
