import type { Metadata, Viewport } from 'next';
import './globals.css';
import MetaPixel from '@/components/analytics/MetaPixel';
import UtmCapture from '@/components/analytics/UtmCapture';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Moj Auto Diler — Premium automobili iz uvoza',
    template: '%s | Moj Auto Diler',
  },
  description: 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom, dokumentovanim stanjem i sigurnom kupovinom u Srbiji.',
  manifest: '/manifest.json',
  applicationName: 'Moj Auto Diler',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    siteName: 'Moj Auto Diler',
    title: 'Moj Auto Diler — Premium automobili iz uvoza',
    description: 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom i sigurnom kupovinom u Srbiji.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Moj Auto Diler — premium automobili iz uvoza' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moj Auto Diler — Premium automobili iz uvoza',
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
    <html lang="sr" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        {/* Meta Pixel — loads after hydration, tracks SPA route changes */}
        <MetaPixel />
        {/* UTM capture — persists ad campaign params to sessionStorage for lead attribution */}
        <UtmCapture />
      </body>
    </html>
  );
}
