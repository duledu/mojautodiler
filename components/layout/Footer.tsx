import Link from 'next/link';
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { FacebookIcon, InstagramIcon, ViberIcon } from '@/components/ui/SocialIcons';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { getDealerInfo } from '@/data/vehicles';

interface FooterProps {
  readonly locale: Locale;
  readonly t: TranslationKeys;
}

export default function Footer({ locale, t }: FooterProps) {
  const dealer = getDealerInfo();

  const links = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/inventory`, label: t.nav.inventory },
    { href: `/${locale}/contact`, label: t.nav.contact },
    { href: `/${locale}/admin`, label: t.nav.admin },
  ];

  return (
    <footer className="bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_1fr_0.9fr]">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div
                  className="font-bold leading-none text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  AutoFerari
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                  Salon
                </div>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-[var(--color-text-muted)]">
              {t.footer.tagline}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href={dealer.facebook} label="Facebook">
                <FacebookIcon size={16} />
              </SocialLink>
              <SocialLink href={dealer.instagram} label="Instagram">
                <InstagramIcon size={16} />
              </SocialLink>
              <SocialLink
                href={`viber://chat?number=${dealer.viber.replace(/\s/g, '')}`}
                label="Viber"
              >
                <ViberIcon size={16} />
              </SocialLink>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3
              className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t.footer.links}
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--accent-dark)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t.nav.contact}
            </h3>
            <ul className="space-y-4">
              <ContactItem icon={<MapPin size={15} />} text={dealer.address} />
              <ContactItem
                icon={<Phone size={15} />}
                text={dealer.phone}
                href={`tel:${dealer.phone}`}
              />
              <ContactItem
                icon={<Mail size={15} />}
                text={dealer.email}
                href={`mailto:${dealer.email}`}
              />
              <ContactItem icon={<Clock size={15} />} text={dealer.workingHours} />
            </ul>
          </div>

          {/* CTA card */}
          <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-5">
            <h3
              className="text-base font-black text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t.contact.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
              {t.contact.subtitle}
            </p>
            <a
              href={`tel:${dealer.phone}`}
              className="btn-gold mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm"
            >
              <Phone size={14} />
              {t.common.call}
            </a>
          </div>
        </div>

        <div className="soft-divider my-8" />
        <div className="flex flex-col gap-2 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AutoFerari Preševo. {t.footer.rights}.</p>
          <p>Premium auto salon • Preševo</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  readonly href: string;
  readonly label: string;
  readonly children: React.ReactNode;
}) {
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

function ContactItem({
  icon,
  text,
  href,
}: {
  readonly icon: React.ReactNode;
  readonly text: string;
  readonly href?: string;
}) {
  const content = (
    <>
      <span className="mt-0.5 shrink-0 text-[var(--accent)]">{icon}</span>
      <span className="text-sm leading-6 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text)]">
        {text}
      </span>
    </>
  );

  if (href) {
    return (
      <li>
        <a href={href} className="group flex items-start gap-3">
          {content}
        </a>
      </li>
    );
  }

  return <li className="flex items-start gap-3">{content}</li>;
}
