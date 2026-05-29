'use client';

import { ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type Locale = 'sr' | 'sq';

const COPY = {
  sr: {
    badge:       'PRIVATNI PREGLED',
    title:       'Moj Auto Diler\nuskoro stiže.',
    subtitle:    'Moj Auto Diler je trenutno dostupan u okviru privatnog pregleda pre zvaničnog lansiranja.',
    placeholder: 'Unesite pristupnu lozinku',
    button:      'Pristupi sajtu',
    loading:     'Proveravanje…',
    error:       'Pogrešna lozinka. Pokušajte ponovo.',
  },
  sq: {
    badge:       'PARAQITJE PRIVATE',
    title:       'Moj Auto Diler\nsë shpejti.',
    subtitle:    'Faqja është aktualisht në fazë private përpara lansimit zyrtar.',
    placeholder: 'Shkruani fjalëkalimin e qasjes',
    button:      'Hyr në faqe',
    loading:     'Duke kontrolluar…',
    error:       'Fjalëkalim i pasaktë. Provoni sërish.',
  },
} as const;

interface Props {
  readonly from:   string;
  readonly locale: Locale;
}

export default function LockScreen({ from, locale }: Props) {
  const c = COPY[locale];
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!password || loading) return;
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/lock/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password, from }),
      });

      if (res.ok) {
        const { redirect } = await res.json() as { redirect: string };
        // Full reload so the middleware picks up the new cookie
        globalThis.location.href = redirect;
        return;
      }
    } catch {
      // network error — fall through to error state
    }

    setLoading(false);
    setError(true);
    setPassword('');
    inputRef.current?.focus();
  };

  const titleLines = c.title.split('\n');

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center px-4 py-12"
      style={{
        background: [
          'radial-gradient(ellipse 70% 55% at 20% 80%, rgba(201,168,76,0.07) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 85% 15%, rgba(201,168,76,0.05) 0%, transparent 50%)',
          'linear-gradient(180deg, #070710 0%, #0C0B14 60%, #080810 100%)',
        ].join(', '),
      }}
    >
      {/* Subtle grain texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* Glass card */}
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-[28px]"
        style={{
          background:   'rgba(8,8,14,0.80)',
          border:       '1px solid rgba(201,168,76,0.16)',
          boxShadow:    '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 40%, rgba(201,168,76,0.5) 60%, transparent 100%)' }}
          aria-hidden="true"
        />

        <div className="px-8 pb-9 pt-8 sm:px-10 sm:pb-10 sm:pt-9">

          {/* Badge pill */}
          <div className="flex justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
              style={{
                color:      'rgba(201,168,76,0.75)',
                background: 'rgba(201,168,76,0.08)',
                border:     '1px solid rgba(201,168,76,0.2)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-80" />
              {c.badge}
            </span>
          </div>

          {/* Brand mark */}
          <div className="mt-7 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.png"
              alt="Moj Auto Diler"
              width={76}
              height={76}
              style={{
                display: 'block',
                filter: 'drop-shadow(0 6px 20px rgba(201,168,76,0.30))',
              }}
            />
            <p
              className="text-[11px] font-black tracking-[0.28em]"
              style={{ color: 'rgba(201,168,76,0.70)', fontFamily: 'var(--font-display)' }}
            >
              MOJ AUTO DILER
            </p>
          </div>

          {/* Divider */}
          <div className="mx-auto mt-7 h-px w-10 rounded-full" style={{ background: 'rgba(201,168,76,0.18)' }} aria-hidden="true" />

          {/* Headline */}
          <h1
            className="mt-7 text-center text-[1.45rem] font-black leading-[1.18] sm:text-[1.65rem]"
            style={{ fontFamily: 'var(--font-display)', color: '#ffffff' }}
          >
            {titleLines.map((line, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={line + i} className={i < titleLines.length - 1 ? 'block' : undefined}>{line}</span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-center text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {c.subtitle}
          </p>

          {/* Form */}
          <div className="mt-8">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit(); }}
              placeholder={c.placeholder}
              autoComplete="current-password"
              className="w-full rounded-2xl border px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/25 sm:text-base"
              style={{
                background:  'rgba(255,255,255,0.055)',
                borderColor: error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.10)',
                boxShadow:   error ? '0 0 0 3px rgba(248,113,113,0.08)' : undefined,
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)';
                e.currentTarget.style.boxShadow = error
                  ? '0 0 0 3px rgba(248,113,113,0.08)'
                  : '0 0 0 3px rgba(201,168,76,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.10)';
                e.currentTarget.style.boxShadow  = error ? '0 0 0 3px rgba(248,113,113,0.08)' : '';
              }}
            />

            <button
              type="button"
              onClick={() => void handleSubmit()}
              aria-disabled={loading || !password}
              className="btn-gold mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm"
            >
              {loading ? c.loading : <>{c.button}<ArrowRight size={16} /></>}
            </button>

            {/* Error */}
            <div
              className="mt-3 text-center text-[13px] transition-all duration-200"
              style={{
                color:   'rgba(248,113,113,0.9)',
                opacity: error ? 1 : 0,
                transform: error ? 'translateY(0)' : 'translateY(-4px)',
              }}
              aria-live="polite"
            >
              {c.error}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center border-t px-8 py-4 sm:px-10"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)' }}>
            © 2026 Moj Auto Diler
          </p>
        </div>
      </div>
    </div>
  );
}
