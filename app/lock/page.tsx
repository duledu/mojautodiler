import type { Metadata } from 'next';
import LockScreen from './LockScreen';

export const metadata: Metadata = {
  title:  'Privatni pregled | Moj Auto Diler',
  robots: { index: false, follow: false },
};

export default async function LockPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const from   = params.from && params.from.startsWith('/') ? params.from : '/sr';
  const locale  = from.startsWith('/sq') ? 'sq' : 'sr';

  return <LockScreen from={from} locale={locale} />;
}
