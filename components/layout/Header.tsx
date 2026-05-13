'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, ShieldCheck } from 'lucide-react';
import { Locale, localeNames, locales, TranslationKeys } from '@/lib/i18n';
import { getDealerInfo } from '@/data/vehicles';
import { cn } from '@/lib/utils';

interface HeaderProps {
  readonly locale: Locale;
  readonly t: TranslationKeys;
}

export default function Header({ locale, t }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dealer = getDealerInfo();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLocalePath = (newLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/inventory`, label: t.nav.inventory },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || isOpen
          ? 'bg-white border-b border-[var(--color-border)] py-3 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
          : 'bg-white/90 backdrop-blur-md border-b border-transparent py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <div
              className="text-[var(--color-text)] font-bold text-[15px] leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              AutoElite
            </div>
            <div className="text-[10px] text-[var(--accent-dark)] uppercase tracking-[0.18em] leading-none mt-1">
              Salon
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/${locale}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-dark)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                )}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-0.5">
            {locales.map((l) => (
              <Link
                key={l}
                href={getLocalePath(l)}
                className={cn(
                  'text-xs px-2.5 py-1.5 rounded-md transition-all font-semibold',
                  l === locale
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                )}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* Phone CTA */}
          <a
            href={`tel:${dealer.phone}`}
            className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Phone size={14} />
            <span>{dealer.phone}</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== `/${locale}` && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent-dark)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                  )}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center gap-2">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={getLocalePath(l)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg font-semibold',
                    l === locale
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  )}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {localeNames[l]}
                </Link>
              ))}
            </div>
            <a
              href={`tel:${dealer.phone}`}
              className="btn-gold flex items-center justify-center gap-2 w-full mt-3 px-4 py-3 rounded-xl text-sm"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Phone size={14} />
              {dealer.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
