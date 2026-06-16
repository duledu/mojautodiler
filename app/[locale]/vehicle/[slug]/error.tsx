'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function VehicleError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'sr';

  useEffect(() => {
    console.error('[vehicle-page] render error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
      </div>
      <h1 className="text-2xl font-black text-[var(--color-text)] sm:text-3xl">
        {locale === 'sq' ? 'Faqja e automjetit nuk u ngarkua' : 'Stranica vozila nije učitana'}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)] sm:text-base sm:leading-7">
        {locale === 'sq'
          ? 'Ndodhi një problem i përkohshëm. Provo sërish ose kthehu te lista.'
          : 'Došlo je do privremenog problema. Pokušaj ponovo ili se vrati na listu vozila.'}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={reset}
          className="btn-gold inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm"
        >
          <RefreshCw size={15} />
          {locale === 'sq' ? 'Provo sërish' : 'Pokušaj ponovo'}
        </button>
        <Link
          href={`/${locale}/inventory`}
          className="btn-outline inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm"
        >
          <ArrowLeft size={15} />
          {locale === 'sq' ? 'Të gjitha automjetet' : 'Sva vozila'}
        </Link>
      </div>
    </div>
  );
}
