import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CheckCircle2, FileCheck2, Share2, ShieldCheck } from 'lucide-react';
import { isValidLocale, type Locale } from '@/lib/i18n';
import {
  CARVERTICAL_AFFILIATE_REL,
  CARVERTICAL_AFFILIATE_TARGET,
  CARVERTICAL_ASSETS,
  getCarVerticalDealersUrl,
} from '@/lib/affiliate/carvertical';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const isSq = locale === 'sq';
  const title = isSq
    ? 'Tregojuni blerësve historinë e automjetit | carVertical për tregtarët — MojAutoDiler'
    : 'Pokažite kupcima istoriju vozila | carVertical za dilere — MojAutoDiler';
  const description = isSq
    ? 'Përgatitni raportin carVertical dhe ndajeni me blerësit e interesuar para shikimit me 20% zbritje.'
    : 'Pripremite carVertical izveštaj i podelite ga sa zainteresovanim kupcima pre razgledanja uz 20% popusta.';

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/carvertical-dileri`,
      languages: {
        sr: '/sr/carvertical-dileri',
        sq: '/sq/carvertical-dileri',
      },
    },
  };
}

export default async function CarVerticalDealersPage(
  { params }: { readonly params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const isSq = locale === 'sq';
  const dealersAffiliateUrl = getCarVerticalDealersUrl();

  const copy = {
    backToHome: isSq ? 'Kthehu në ballinë' : 'Nazad na početnu',
    partnerBadge: isSq ? 'Program partner për shitës dhe auto-sallone' : 'Zvanični partner program za prodavce i auto-placeve',
    heading: isSq ? 'Tregojuni blerësve historinë e automjetit' : 'Pokažite kupcima istoriju vozila',
    description: isSq
      ? 'Përgatitni raportin carVertical dhe ndajeni me blerësit e interesuar para shikimit.'
      : 'Pripremite carVertical izveštaj i podelite ga sa zainteresovanim kupcima pre razgledanja.',
    offer: isSq ? '20% zbritje' : '20% popusta',
    offerText: isSq
      ? 'Zbritja zbatohet automatikisht përmes linkut tonë partner.'
      : 'Popust se automatski primenjuje putem našeg partnerskog linka.',
    ctaButton: isSq ? 'Kontrollo historinë e mjetit' : 'Proveri istoriju vozila',
    howItWorksTitle: isSq ? 'Si mund ta ndani raportin me blerësin?' : 'Kako možete podeliti izveštaj sa kupcem?',
    howItWorksSubtitle: isSq
      ? 'Procesi i plotë në tre hapa të thjeshtë për të rritur besimin dhe përshpejtuar shitjen.'
      : 'Kompletan proces u tri jednostavna koraka za podizanje poverenja i bržu prodaju.',
    steps: [
      {
        number: '01',
        title: isSq ? 'Futni numrin e shasisë (VIN)' : 'Unesite broj šasije (VIN)',
        desc: isSq
          ? 'Hapni carVertical përmes linkut tonë partner me 20% zbritje automatike dhe vendosni numrin VIN të veturës nga oferta juaj.'
          : 'Otvorite carVertical preko našeg partnerskog linka sa automatskih 20% popusta i unesite VIN broj automobila iz vaše ponude.',
        icon: ShieldCheck,
      },
      {
        number: '02',
        title: isSq ? 'Shkarkoni raportin zyrtar' : 'Preuzmite zvanični izveštaj',
        desc: isSq
          ? 'Merrni dosjen e plotë digjitale me kilometrazhin e verifikuar, dëmtimet e regjistruara dhe historinë e plotë evropiane.'
          : 'Generišite kompletan digitalni dosije sa verifikovanom kilometražom, evidencijom oštećenja i prethodnim vlasnicima.',
        icon: FileCheck2,
      },
      {
        number: '03',
        title: isSq ? 'Ndajeni linkun me blerësin' : 'Podelite link sa kupcem',
        desc: isSq
          ? 'Dërgoni linkun digjital përmes WhatsApp, Viber ose bashkëngjiteni në shpalljen tuaj në MojAutoDiler para shikimit.'
          : 'Pošaljite digitalni link kupcu putem WhatsApp-a ili Viber-a, odštampajte PDF za auto-plac, ili ga priložite uz oglas na MojAutoDileru.',
        icon: Share2,
      },
    ],
    benefitsTitle: isSq ? 'Përparësitë kryesore për tregtarët' : 'Ključne prednosti za auto-dilere',
    benefits: [
      isSq ? 'Kupci vendosin më shpejt kur shohin të dhëna transparente' : 'Kupci donose odluku o kupovini brže kada unapred vide proverenu istoriju',
      isSq ? 'Eleminoni dyshimet për kilometrazhin dhe dëmtimet e fshehura' : 'Eliminišite nepoverenje i sumnje oko vraćene kilometraže i skrivenih šteta',
      isSq ? 'Dallohuni si një auto-sallon profesional me reputacion të lartë' : 'Izgradite reputaciju profesionalnog i transparentnog auto-placa',
    ],
    disclaimer: isSq
      ? 'Disponueshmëria e të dhënave në raport varet nga automjeti dhe burimet zyrtare. Zbritja prej 20% zbatohet automatikisht me klikim në linkun partner.'
      : 'Dostupnost podataka u izveštaju zavisi od vozila i zvaničnih izvora. Popust od 20% se automatski primenjuje putem našeg partnerskog linka.',
  };

  return (
    <div className="min-h-screen bg-[#0B111E] text-white">
      {/* ── MINIMAL TOP BAR: Only Logo & "Nazad na početnu" ── */}
      <header className="border-b border-white/10 bg-[#0B111E]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1 transition group-hover:border-white/25">
                <Image
                  src="/brand-logo.png"
                  alt="Moj Auto Diler"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-white sm:text-base leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  Moj Auto Diler
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mt-0.5">
                  Partner Portal
                </span>
              </div>
            </Link>
            <div className="hidden h-5 w-px bg-white/20 sm:block mx-1" aria-hidden="true" />
            <div className="hidden items-center sm:flex">
              <Image
                src={CARVERTICAL_ASSETS.logoWhite}
                alt="carVertical"
                width={100}
                height={16}
                className="h-3.5 w-auto opacity-80"
              />
            </div>
          </div>

          {/* Action 2: Nazad na početnu (Secondary action) */}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white/85 transition-all duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>{copy.backToHome}</span>
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION: 2-Column Desktop, 1-Column Mobile with Text First ── */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24">
        {/* Subtle automotive studio ambient backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0, 115, 240, 0.22), transparent 75%)',
          }}
          aria-hidden="true"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            {/* ── TEXT & OFFER COLUMN: First on Mobile, Left on Desktop ── */}
            <div className="order-1 flex flex-col justify-center lg:col-span-7 xl:col-span-7">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--accent-dark)] sm:text-xs">
                <ShieldCheck size={14} className="text-[var(--accent)] shrink-0" />
                <span>{copy.partnerBadge}</span>
              </div>

              {/* Naslov (Headline) */}
              <h1
                className="mt-4 text-3xl font-black tracking-tight !text-white sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08]"
                style={{ fontFamily: 'var(--font-display)', color: '#ffffff' }}
              >
                {copy.heading}
              </h1>

              {/* Opis (Description) */}
              <p className="mt-4 text-base sm:text-lg lg:text-xl leading-relaxed text-slate-300 max-w-2xl font-normal">
                {copy.description}
              </p>

              {/* Ponuda (Offer card / badge) */}
              <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.05] p-4 sm:p-5 backdrop-blur-sm max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-block rounded-lg bg-[#FFEB28] px-3.5 py-1 text-base sm:text-lg font-black uppercase tracking-wider text-[#0F0F14] shadow-sm">
                    {copy.offer}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/90">
                    Ekskluzivni kod: <code className="rounded bg-black/40 px-2 py-0.5 font-mono font-bold text-[#FFEB28]">MOJAUTODILER</code>
                  </span>
                </div>
                {/* Tekst uz ponudu */}
                <p className="mt-2.5 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {copy.offerText}
                </p>
              </div>

              {/* Action 1: Glavno dugme (Primary CTA) */}
              <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
                <a
                  href={dealersAffiliateUrl}
                  target={CARVERTICAL_AFFILIATE_TARGET}
                  rel={CARVERTICAL_AFFILIATE_REL}
                  className="inline-flex min-h-[56px] w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-[#0073F0] px-8 py-4 text-base sm:text-lg font-black text-white shadow-[0_8px_28px_rgba(0,115,240,0.35)] transition-all duration-200 hover:bg-[#0060cc] hover:shadow-[0_12px_36px_rgba(0,115,240,0.45)] hover:scale-[1.01] active:scale-[0.99] text-center"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span>{copy.ctaButton}</span>
                  <ArrowUpRight size={20} className="shrink-0" />
                </a>
              </div>
            </div>

            {/* ── AUTOMOTIVE PHOTOGRAPHY: Second on Mobile, Right on Desktop ── */}
            <div className="order-2 mt-8 lg:mt-0 lg:col-span-5 xl:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
                {/* Real car photography from campaign assets */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/carvertical/dealers-hero-car.png"
                    alt="carVertical provera istorije vozila za auto-dilere"
                    fill
                    priority
                    sizes="(min-width: 1280px) 520px, (min-width: 1024px) 450px, 100vw"
                    className="object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B111E]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
                    <span className="rounded-md bg-black/60 px-2.5 py-1 font-mono text-[11px] backdrop-blur-md">
                      Transparentan izveštaj
                    </span>
                    <span className="font-semibold text-[11px] text-[#FFEB28]">
                      20% popusta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIGHT SECTION: Official carVertical visual & 3-Step Sharing Guide ── */}
      <section className="bg-white text-slate-900 py-12 sm:py-16 lg:py-20 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header of section */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0073F0]">
              <span>Zvanični carVertical izveštaj</span>
            </div>
            <h2
              className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl tracking-tight leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {copy.howItWorksTitle}
            </h2>
            <p className="mt-2.5 text-base sm:text-lg text-slate-600">
              {copy.howItWorksSubtitle}
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {copy.steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#0073F0]">
                        <Icon size={22} />
                      </div>
                      <span className="font-mono text-2xl font-black text-slate-300">
                        {step.number}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-black text-slate-900"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official carVertical Visual & Benefits Grid */}
          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Official banner */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Image
                    src="/carvertical/RS_336x280-5.png"
                    alt="carVertical zvanični izveštaj o istoriji vozila"
                    width={480}
                    height={400}
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>

              {/* Right: Benefits & Final CTA */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <h3
                  className="text-xl sm:text-2xl font-black text-slate-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {copy.benefitsTitle}
                </h3>
                <ul className="mt-4 space-y-3.5">
                  {copy.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base font-medium text-slate-700 leading-snug">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Popust za sve članove
                      </p>
                      <p className="text-lg font-black text-[#0073F0]">
                        20% popusta uz kod MOJAUTODILER
                      </p>
                    </div>
                    <a
                      href={dealersAffiliateUrl}
                      target={CARVERTICAL_AFFILIATE_TARGET}
                      rel={CARVERTICAL_AFFILIATE_REL}
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0073F0] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0060cc]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <span>{copy.ctaButton}</span>
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINIMAL CLEAN FOOTER: No admin, no menu, only Back & Disclaimer ── */}
      <footer className="border-t border-white/10 bg-[#0B111E] py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="leading-relaxed text-left text-slate-400 max-w-2xl text-[11px] sm:text-xs">
            {copy.disclaimer}
          </p>
          <div className="shrink-0">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-1.5 font-bold text-white/80 hover:text-white transition"
            >
              <ArrowLeft size={13} />
              <span>{copy.backToHome}</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
