import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { JsonLd, siteGraph } from "@/components/seo/JsonLd";
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // Every relative URL in a child route's metadata (canonicals, og:image) is
  // resolved against this, so it has to be set at the root or Next emits
  // relative Open Graph URLs that crawlers reject.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Child routes set a short title; the brand suffix is appended here so no
    // page has to repeat it and none of them can forget it.
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "matrimony",
  // Deliberately no canonical here. Metadata is inherited, so a canonical set at
  // the root is handed to every route that does not override it — including
  // /_not-found, which would then tell Google that every 404 URL on the domain
  // *is* the home page. Each indexable route sets its own via pageMetadata().
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Without these, Google truncates the snippet and refuses to show large
      // image previews for the page in Discover and rich results.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  referrer: "origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the maroon/pink brand band so mobile browser chrome blends into the
  // page instead of framing it in white.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0d14" },
  ],
};

/* Resolves the preference (including 'system') and always writes a concrete
   data-theme. globals.css relies on that attribute being authoritative — it has
   a single dark block and no prefers-color-scheme query. */
const NO_FLASH_THEME_SCRIPT = `
(function () {
  var stored = null;
  try { stored = window.localStorage.getItem('biyekoralagbe_theme'); } catch (e) {}
  var resolved = (stored === 'light' || stored === 'dark')
    ? stored
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', resolved);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <head>

        <GoogleAnalytics /> 
        <MetaPixel />
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
        <JsonLd data={siteGraph} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)]">
        <Providers>{children}</Providers>
        <GoogleAnalytics />
        <MetaPixel />
      </body>
    </html>
  );
}
