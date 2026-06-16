'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function AdminVehicleError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin-vehicle] render error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
          <AlertTriangle size={24} className="text-amber-500" />
        </div>
      </div>
      <h1 className="text-xl font-black text-[var(--color-text)]">Greška pri učitavanju vozila</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
        Došlo je do privremenog problema sa bazom podataka. Pokušaj ponovo ili se vrati na listu.
      </p>
      <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={reset}
          className="btn-gold inline-flex min-h-10 items-center gap-2 rounded-xl px-5 text-sm"
        >
          <RefreshCw size={14} />
          Pokušaj ponovo
        </button>
        <Link
          href="./../../"
          className="btn-outline inline-flex min-h-10 items-center gap-2 rounded-xl px-5 text-sm"
        >
          <ArrowLeft size={14} />
          Lista vozila
        </Link>
      </div>
    </div>
  );
}
