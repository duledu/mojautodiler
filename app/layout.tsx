import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AutoFerari Preševo | Premium automobili sa transparentnom istorijom', template: '%s | AutoFerari Preševo' },
  description: 'Premium automobili sa transparentnom istorijom. Pouzdan auto salon u Preševu za pažljivo odabrana premium vozila.',
  manifest: '/manifest.json',
  openGraph: { type: 'website', siteName: 'AutoFerari Preševo' },
};
export const viewport: Viewport = { themeColor: '#0A0A0B', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
