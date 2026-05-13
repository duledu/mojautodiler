import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-obsidian)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Gold AE mark */}
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 flex items-center justify-center mx-auto mb-8">
          <span className="text-[var(--color-gold)] text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>AE</span>
        </div>

        <p className="text-[var(--color-gold)] text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Greška 404
        </p>

        <h1 className="text-white text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Stranica nije pronađena
        </h1>

        <p className="text-[var(--color-mist)] text-base leading-relaxed mb-10">
          Stranica koju tražite ne postoji ili je uklonjena. Proverite URL ili se
          vratite na početnu stranicu.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sr"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-[var(--color-obsidian)] font-semibold px-6 py-3 rounded-lg transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Početna stranica
          </Link>
          <Link
            href="/sr/inventory"
            className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-[var(--color-gold)]/30 text-[var(--color-mist)] hover:text-white font-medium px-6 py-3 rounded-lg transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pregledaj vozila
          </Link>
        </div>
      </div>
    </div>
  );
}
