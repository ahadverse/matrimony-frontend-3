import type { Metadata } from "next";
import { Fraunces, Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
  title: "Biye Kori — Find Your Match",
  description: "A modern, privacy-first matrimony platform for Bangladesh.",
};

/* Resolves the preference (including 'system') and always writes a concrete
   data-theme. globals.css relies on that attribute being authoritative — it has
   a single dark block and no prefers-color-scheme query. */
const NO_FLASH_THEME_SCRIPT = `
(function () {
  var stored = null;
  try { stored = window.localStorage.getItem('biyekori_theme'); } catch (e) {}
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
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
