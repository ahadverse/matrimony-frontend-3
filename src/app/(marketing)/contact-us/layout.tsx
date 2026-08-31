import type { Metadata } from 'next';
import { MarketingPageSeo } from '@/components/seo/MarketingPageSeo';
import { contactPageSchema } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Contact Us — Member and Family Support';
const DESCRIPTION =
  'Reach our support team by phone, email, WhatsApp or the contact form, from any country, with questions about verification, payments, approval or safety.';
const PATH = '/contact-us';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'Biye Kora Lagbe contact',
    'matrimony support worldwide',
    'matrimony helpline',
  ],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ContactPage rather than the default WebPage: it is what carries the
          phone, email and postal address into the brand's knowledge panel. */}
      <MarketingPageSeo
        name="Contact Us"
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        pageNode={contactPageSchema({ name: TITLE, description: DESCRIPTION, path: PATH })}
      />
      {children}
    </>
  );
}
