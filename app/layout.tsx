import type { Metadata, Viewport } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});
import MetaPixel from '@/components/analytics/MetaPixel';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import UtmCapture from '@/components/analytics/UtmCapture';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import PwaInstallBanner from '@/components/pwa/PwaInstallBanner';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Moj Auto Diler | Premium automobili iz uvoza',
    template: '%s | Moj Auto Diler',
  },
  description: 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom, dokumentovanim stanjem i sigurnom kupovinom u Srbiji.',
  manifest: '/manifest.json',
  applicationName: 'Moj Auto Diler',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    siteName: 'Moj Auto Diler',
    title: 'Moj Auto Diler | Premium automobili iz uvoza',
    description: 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom i sigurnom kupovinom u Srbiji.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Moj Auto Diler, premium automobili iz uvoza' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moj Auto Diler | Premium automobili iz uvoza',
    description: 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom i sigurnom kupovinom u Srbiji.',
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#C9A84C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="sr" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        {children}
        {/* Meta Pixel — loads after hydration, tracks SPA route changes */}
        <MetaPixel />
        {/* Google Analytics 4 — loads after hydration, tracks SPA route changes */}
        <GoogleAnalytics />
        {/* UTM capture — persists ad campaign params to sessionStorage for lead attribution */}
        <UtmCapture />
        <ServiceWorkerRegister />
        <PwaInstallBanner />
      </body>
    </html>
  );
}
