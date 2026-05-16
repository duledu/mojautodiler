import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Moj Auto Diler', template: '%s | Moj Auto Diler' },
  description: 'Premium auto market za pažljivo odabrana vozila sa transparentnom istorijom i sigurnom kupovinom u Srbiji.',
  manifest: '/manifest.json',
  applicationName: 'Moj Auto Diler',
  openGraph: {
    type: 'website',
    siteName: 'Moj Auto Diler',
    title: 'Moj Auto Diler',
    description: 'Premium auto market za pažljivo odabrana vozila sa transparentnom istorijom i sigurnom kupovinom u Srbiji.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moj Auto Diler',
    description: 'Premium auto market za pažljivo odabrana vozila sa transparentnom istorijom i sigurnom kupovinom u Srbiji.',
  },
};
export const viewport: Viewport = { themeColor: '#0A0A0B', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
