import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Mail, MapPin, Scale } from 'lucide-react';
import { FacebookIcon, InstagramIcon, ViberIcon } from '@/components/ui/SocialIcons';
import CarVerticalPromoBanner from '@/components/affiliate/CarVerticalPromoBanner';
import { Locale, TranslationKeys } from '@/lib/i18n';
import type { DealerInfo } from '@/lib/db/mappers';
import {
  CARVERTICAL_ASSETS,
  getCarVerticalFooterUrl,
} from '@/lib/affiliate/carvertical';
import { FOOTER_PLATFORM_DESCRIPTION } from '@/lib/legal/responsibility-disclaimer';

interface FooterProps {
  readonly locale: Locale;
  readonly t: TranslationKeys;
  readonly dealer: DealerInfo;
}

export default function Footer({ locale, t, dealer }: FooterProps) {
  const links = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/inventory`, label: t.nav.inventory },
    { href: '/sr/blog', label: t.nav.blog },
    { href: `/${locale}/contact`, label: t.nav.contact },
    { href: `/${locale}/admin`, label: t.nav.admin },
  ];

  const cleanViber = dealer.viber.replace(/\D/g, '');

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {/* ── carVertical footer promotion — same shared layout as the homepage carVertical hero banner ── */}
        <div data-testid="carvertical-footer-partner" className="mb-10 sm:mb-12">
          <CarVerticalPromoBanner
            variant="footer"
            href={getCarVerticalFooterUrl()}
            imageSrc={CARVERTICAL_ASSETS.footerBannerRs}
            imageAlt="carVertical — Saznajte pravu istinu pre kupovine. Proverite odmah."
            imageBackground="#0068FF"
            eyebrow="PROVERI PRE KUPOVINE"
            heading="Kupuješ polovan automobil? Proveri njegovu istoriju."
            description="Uz carVertical saznaj više o dostupnoj istoriji vozila pre nego što doneseš odluku o kupovini."
            discountBadge="20% POPUSTA"
            supportingText="Popust se automatski primenjuje putem našeg partnerskog linka."
            cta="Proveri istoriju vozila"
            ariaLabel="Kupuješ polovan automobil? Proveri njegovu istoriju uz carVertical — 20% POPUSTA. Popust se automatski primenjuje putem našeg partnerskog linka."
            testId="carvertical-footer-cta"
          />
        </div>

        {/* ── Existing Footer Navigation, Contact & Dealer Info ── */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_1fr_0.9fr]">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="mb-5 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
                <Image
                  src="/brand-logo.png"
                  alt="Moj Auto Diler"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="font-bold leading-none text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {dealer.name || 'Moj Auto Diler'}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--accent-dark)]">PREMIUM AUTO MARKET</div>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-[var(--color-text-muted)]">{t.footer.tagline}</p>
            <div className="mt-5 flex items-center gap-2">
              {dealer.facebook && (
                <SocialLink href={dealer.facebook} label="Facebook">
                  <FacebookIcon size={16} />
                </SocialLink>
              )}
              {dealer.instagram && (
                <SocialLink href={dealer.instagram} label="Instagram">
                  <InstagramIcon size={16} />
                </SocialLink>
              )}
              {dealer.viber && (
                <SocialLink href={`viber://chat?number=%2B${cleanViber}`} label="Viber">
                  <ViberIcon size={16} />
                </SocialLink>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              {t.footer.links}
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--accent-dark)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — phone row hidden; data kept in admin/database */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              {t.nav.contact}
            </h3>
            <ul className="space-y-4">
              {dealer.address      && <ContactItem icon={<MapPin size={15} />} text={dealer.address} />}
              {dealer.email        && <ContactItem icon={<Mail size={15} />}   text={dealer.email}   href={`mailto:${dealer.email}`} />}
              {dealer.workingHours && <ContactItem icon={<Clock size={15} />}  text={dealer.workingHours} />}
            </ul>
          </div>

          {/* CTA card */}
          <div>
            <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-5">
              <h3 className="text-base font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                {t.contact.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{t.contact.subtitle}</p>
              {/* Phone CTA button — temporarily hidden; dealer phone data kept in system.
              {dealer.phone && (
                <a href={`tel:${dealer.phone}`} className="btn-gold mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm">
                  <Phone size={14} />
                  {t.common.call}
                </a>
              )} */}
            </div>
          </div>
        </div>

        {/* ── O platformi MojAutoDiler — Legal Platform Description ── */}
        <section
          aria-labelledby="footer-platform-description-heading"
          data-testid="footer-platform-description"
          className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white/75 p-5 shadow-[0_2px_12px_rgba(15,15,20,0.03)] sm:mt-12 sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-dark)]">
                <Scale size={14} aria-hidden="true" />
              </span>
              <h3
                id="footer-platform-description-heading"
                className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text)] sm:text-sm"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {FOOTER_PLATFORM_DESCRIPTION.title}
              </h3>
            </div>
            <a
              href={FOOTER_PLATFORM_DESCRIPTION.linkHref}
              data-testid="footer-responsibility-link"
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--accent-dark)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)]"
            >
              {FOOTER_PLATFORM_DESCRIPTION.linkLabel}
              <ArrowRight size={13} aria-hidden="true" />
            </a>
          </div>
          <div className="mt-3.5 space-y-2.5 text-xs leading-6 text-[var(--color-text-muted)] sm:text-[13px]">
            {FOOTER_PLATFORM_DESCRIPTION.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <div className="soft-divider my-8" />
        <div className="flex flex-col gap-2 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {dealer.name || 'Moj Auto Diler'}. {t.footer.rights}.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href={FOOTER_PLATFORM_DESCRIPTION.linkHref}
              className="font-medium text-[var(--color-text-muted)] underline-offset-4 transition-colors hover:text-[var(--accent-dark)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)]"
            >
              {FOOTER_PLATFORM_DESCRIPTION.linkLabel}
            </a>
            <span aria-hidden="true">•</span>
            <p>PREMIUM AUTO MARKET • Srbija</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { readonly href: string; readonly label: string; readonly children: React.ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      aria-label={label}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-muted)] shadow-sm transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
    >
      {children}
    </a>
  );
}

function ContactItem({ icon, text, href }: { readonly icon: React.ReactNode; readonly text: string; readonly href?: string }) {
  const content = (
    <>
      <span className="mt-0.5 shrink-0 text-[var(--accent)]">{icon}</span>
      <span className="whitespace-pre-line text-sm leading-6 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text)]">
        {text}
      </span>
    </>
  );
  if (href) {
    return (
      <li><a href={href} className="group flex items-start gap-3">{content}</a></li>
    );
  }
  return <li className="flex items-start gap-3">{content}</li>;
}
