'use client';

import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

const copy = {
  sr: {
    title: 'Prijavite se',
    subtitle: 'Admin panel · AutoFerari Preševo',
    email: 'Email adresa',
    emailPlaceholder: 'admin@example.com',
    password: 'Lozinka',
    passwordPlaceholder: '••••••••',
    submit: 'Prijavite se',
    submitting: 'Prijava u toku…',
    errorGeneric: 'Pogrešan email ili lozinka. Pokušajte ponovo.',
    errorRateLimit: 'Previše neuspelih pokušaja. Sačekajte 15 minuta.',
    footerNote: 'Zaštićen admin pristup',
  },
  sq: {
    title: 'Kyçuni',
    subtitle: 'Paneli admin · AutoFerari Preševo',
    email: 'Adresa email',
    emailPlaceholder: 'admin@example.com',
    password: 'Fjalëkalimi',
    passwordPlaceholder: '••••••••',
    submit: 'Kyçuni',
    submitting: 'Duke u kyçur…',
    errorGeneric: 'Email ose fjalëkalim i gabuar. Provoni përsëri.',
    errorRateLimit: 'Shumë tentativa të dështuara. Prisni 15 minuta.',
    footerNote: 'Qasje e mbrojtur admin',
  },
} satisfies Record<Locale, {
  title: string; subtitle: string; email: string; emailPlaceholder: string;
  password: string; passwordPlaceholder: string; submit: string; submitting: string;
  errorGeneric: string; errorRateLimit: string; footerNote: string;
}>;

interface Props {
  readonly locale: Locale;
  readonly redirectTo: string;
}

export default function AdminLoginClient({ locale, redirectTo }: Props) {
  const t = copy[locale];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (res.status === 429) {
        setError(t.errorRateLimit);
        return;
      }
      if (!res.ok) {
        setError(t.errorGeneric);
        return;
      }

      // Hard redirect so the middleware re-evaluates the new cookie
      window.location.href = redirectTo;
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F9] px-4 py-8 sm:py-12">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent)] shadow-[0_8px_28px_rgba(201,168,76,0.35)]">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h1
            className="text-2xl font-black text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.title}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{t.subtitle}</p>
        </div>

        {/* Form card */}
        <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-[0_16px_56px_rgba(15,15,20,0.09)]">
          <div className="h-1 w-full bg-[var(--accent)]" />

          <form onSubmit={handleSubmit} className="space-y-4 p-5 min-[375px]:space-y-5 min-[375px]:p-6 sm:p-8">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
              >
                {t.email}
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder)]"
                />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="input-premium w-full rounded-2xl py-3 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
              >
                {t.password}
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder)]"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="input-premium w-full rounded-2xl py-3 pl-10 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder)] transition hover:text-[var(--color-text-muted)]"
                  aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  {t.submit}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-[var(--color-text-placeholder)]">
          {t.footerNote}
        </p>
      </div>
    </div>
  );
}
