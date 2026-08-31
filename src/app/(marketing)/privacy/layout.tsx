import type { Metadata } from 'next';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Privacy Policy';
const DESCRIPTION =
  'What a profile shows publicly, how photo blurring works, who can see your contact details, how long we keep your data, and how to request its deletion.';
const PATH = '/privacy';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageSeo name="Privacy Policy" title={TITLE} description={DESCRIPTION} path={PATH} />
      {children}
    </>
  );
}
