import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail, Scale, ShieldAlert } from 'lucide-react';
import { LEGAL_RESPONSIBILITY_PAGE } from '@/lib/legal/responsibility-disclaimer';
import type { Locale } from '@/lib/i18n';

interface ResponsibilityDisclaimerContentProps {
  readonly locale?: Locale;
}

export default function ResponsibilityDisclaimerContent({
  locale = 'sr',
}: ResponsibilityDisclaimerContentProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20 pb-16 sm:pb-24">
      {/* Breadcrumb bar */}
      <div className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-[var(--color-text-muted)] sm:px-6">
          <Link
            href={`/${locale}`}
            className="transition-colors hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)]"
          >
            Početna
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate font-medium text-[var(--color-text)]">
            Podela odgovornosti
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
        <Link
          href={`/${locale}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Nazad na početnu stranicu
        </Link>

        {/* Header hero card */}
        <header className="relative overflow-hidden rounded-3xl border border-[var(--accent-border)] bg-white p-6 shadow-[0_12px_40px_rgba(15,15,20,0.06)] sm:p-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--accent)]"
            aria-hidden="true"
          />
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-dark)]">
            <Scale size={13} aria-hidden="true" />
            Pravne informacije • MojAutoDiler.com
          </div>

          <h1
            className="text-2xl font-black leading-tight text-[var(--color-text)] sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {LEGAL_RESPONSIBILITY_PAGE.h1}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
            Ovim dokumentom uređuju se uloga platforme MojAutoDiler.com, podela odgovornosti između platforme, oglašivača, kupaca i nezavisnih partnerskih servisa, kao i uslovi besplatnog korišćenja informativno-oglasnog sadržaja.
          </p>
        </header>

        {/* Legal Sections */}
        <article
          data-testid="legal-responsibility-article"
          className="mt-8 space-y-5 sm:mt-10 sm:space-y-6"
        >
          {LEGAL_RESPONSIBILITY_PAGE.sections.map((section) => {
            const isWarningSection = section.id === 'tehnicka-ispravnost-i-istorija-vozila';
            const isRecommendationSection = section.id === 'preporuke-kupcima';

            return (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`heading-${section.id}`}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_2px_12px_rgba(15,15,20,0.03)] sm:p-8"
              >
                <h2
                  id={`heading-${section.id}`}
                  className="text-lg font-black text-[var(--color-text)] sm:text-xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {section.heading}
                </h2>

                {section.paragraphs && (
                  <div className="mt-3.5 space-y-3 text-sm leading-7 text-[var(--color-text-2)] sm:text-[15px]">
                    {section.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                )}

                {section.paragraphsBeforeBullets && (
                  <div className="mt-3.5 space-y-3 text-sm leading-7 text-[var(--color-text-2)] sm:text-[15px]">
                    {section.paragraphsBeforeBullets.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                )}

                {section.bullets && (
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/75 p-3 text-xs leading-6 text-[var(--color-text-2)] sm:text-sm"
                      >
                        {isWarningSection ? (
                          <ShieldAlert
                            size={15}
                            className="mt-1 shrink-0 text-[var(--accent-dark)]"
                            aria-hidden="true"
                          />
                        ) : isRecommendationSection ? (
                          <CheckCircle2
                            size={15}
                            className="mt-1 shrink-0 text-[var(--accent-dark)]"
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                            aria-hidden="true"
                          />
                        )}
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.paragraphsAfterBullets && (
                  <div className="mt-4 space-y-3 text-sm font-medium leading-7 text-[var(--color-text)] sm:text-[15px]">
                    {section.paragraphsAfterBullets.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                )}

                {section.showContactLink && (
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)]/70">
                    <Link
                      href={`/${locale}/contact`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2.5 text-xs font-bold text-[var(--accent-dark)] transition hover:bg-[var(--accent)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)] sm:text-sm"
                    >
                      <Mail size={14} aria-hidden="true" />
                      Zvanična kontakt stranica
                    </Link>
                  </div>
                )}
              </section>
            );
          })}
        </article>

        {/* Last updated footer note */}
        <footer
          data-testid="legal-last-updated"
          className="mt-8 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 text-xs leading-6 text-[var(--color-text-muted)] sm:mt-10 sm:p-5 sm:text-sm"
        >
          <p>
            <strong className="font-bold text-[var(--color-text)]">
              {LEGAL_RESPONSIBILITY_PAGE.lastUpdatedLabel}
            </strong>{' '}
            <span>{LEGAL_RESPONSIBILITY_PAGE.lastUpdatedValue}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
