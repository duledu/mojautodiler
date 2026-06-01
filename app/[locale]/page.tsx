import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  KeyRound,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react';
import DealerJsonLd from '@/components/seo/DealerJsonLd';
import HeroParallaxImage from '@/components/ui/HeroParallaxImage';
import Reveal from '@/components/ui/Reveal';
import HeroVehicleCard from '@/components/vehicle/HeroVehicleCard';
import { TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { getDealerSettings } from '@/lib/db/settings';
import { getHeroVehicle, getShowcaseVehicles } from '@/lib/db/vehicles';
import { getTranslations, isValidLocale, Locale } from '@/lib/i18n';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const isSq = locale === 'sq';
  return {
    title: isSq
      ? 'Automjete Premium nga Importi | Moj Auto Diler'
      : 'Premium automobili iz uvoza | Moj Auto Diler',
    description: isSq
      ? 'Automjete premium të zgjedhura me kujdes nga importi, me histori transparente dhe blerje të sigurt pa presion në Serbi.'
      : 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom, dokumentovanim stanjem i sigurnom kupovinom bez pritiska u Srbiji.',
    alternates: {
      canonical: `/${locale}`,
      languages: { sr: '/sr', sq: '/sq' },
    },
    openGraph: {
      type: 'website',
      title: isSq
        ? 'Automjete Premium nga Importi | Moj Auto Diler'
        : 'Premium automobili iz uvoza | Moj Auto Diler',
      description: isSq
        ? 'Automjete premium me histori transparente dhe blerje të sigurt.'
        : 'Premium automobili iz uvoza sa transparentnom istorijom i sigurnom kupovinom.',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Moj Auto Diler — premium automobili iz uvoza' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isSq
        ? 'Automjete Premium | Moj Auto Diler'
        : 'Premium automobili | Moj Auto Diler',
      description: isSq
        ? 'Automjete premium me histori transparente. Blerje e sigurt në Serbi.'
        : 'Premium automobili sa transparentnom istorijom. Sigurna kupovina u Srbiji.',
    },
  };
}

const homeCopy = {
  sr: {
    eyebrow: 'Premium ponuda • Preševo',
    title: 'Premium automobili sa transparentnom istorijom.',
    lead: 'Pažljivo odabrana premium vozila iz uvoza iz inostranstva, uz provereno stanje i sigurnu kupovinu bez pritiska.',
    primary: 'Pregledaj vozila',
    secondary: 'Zakazi razgledanje',
    heroNote: 'Diskretna selekcija premium vozila u Srbiji, sa dokumentovanom istorijom i pregledom pre prodaje.',
    featuredLabel: 'Izdvojena ponuda',
    verifiedLine: 'Provereno poreklo, servis i stanje',
    viewDetails: 'Pogledaj detalje',
    stats: [
      ['100+', 'vozila prodato u poslednje 2 godine'],
      ['5.0', 'ocena kupaca'],
      ['100%', 'zadovoljnih kupaca nakon isporuke'],
      ['24h', 'brz odgovor za pregled vozila'],
    ],
    trustTitle: 'Kupovina sa vise sigurnosti',
    trustSub: 'Svaki detalj je postavljen da kupac dobije jasnu sliku pre odluke.',
    trust: [
      ['Pouzdan premium auto market', 'Reputacija potvrdjena kroz kupce i javne recenzije.', ShieldCheck],
      ['Transparentna istorija', 'Poreklo, servis i stanje komuniciramo bez skrivenih stavki.', ClipboardCheck],
      ['Profesionalna provera', 'Vozila se pregledaju pre prodaje i pre preporuke kupcu.', Wrench],
      ['Podrska do isporuke', 'Razgledanje, probna voznja, dokumentacija i tehnicki pregled.', KeyRound],
    ],
    featuredTitle: 'Aktuelna premium selekcija',
    featuredSub: 'Premium vozila dostupna u Srbiji. Svaki oglas vodi ka detaljima i direktnom kontaktu.',
    viewAll: 'Pogledaj celu ponudu',
    darkTitle: 'Mirna odluka pre kupovine.',
    darkAccent: 'pre kupovine',
    darkEyebrow: 'Proces poverenja',
    darkSub: 'Razgovaramo o stanju vozila, realnim troskovima i istoriji pre nego sto dodjete do potpisa. To je razlika izmedju obicne prodaje i pouzdanog partnera.',
    darkCards: [
      ['Provera dokumentacije', 'Detaljno proveravamo dokumentaciju, servisnu istoriju i poreklo vozila.', ClipboardCheck],
      ['Pregled karoserije i enterijera', 'Pregledamo spoljasnjost i unutrasnjost kako bismo uocili vazne detalje pre kupovine.', Car],
      ['Procena stanja i preporuka', 'Dajemo realnu procenu i iskrenu preporuku - bez pritiska i neprijatnih iznenadjenja.', ShieldCheck],
    ],
    darkTrustStrip: ['Transparentno i iskreno', 'Iskustvo koje stedi vreme i novac', 'Bez neprijatnih iznenadjenja', 'Vas pouzdan partner'],
    reviewsTitle: 'Utisci kupaca',
    reviewsSub: 'Kratke recenzije kupaca koji su prosli kroz ceo proces od prvog poziva do isporuke.',
    reviews: [
      ['Excellent experience from first contact to delivery.', 'Milan P.', 'Verified buyer'],
      ['Sve je bilo transparentno, bez pritiska i bez skrivenih troskova.', 'Jelena M.', 'PolovniAutomobili review'],
      ['Auto je bio tacno kao u opisu. Dogovor i preuzimanje su prosli profesionalno.', 'Arben K.', 'Verified buyer'],
    ],
    ctaTitle: 'Spremni za razgledanje?',
    ctaSub: 'Tu smo za sva pitanja oko vozila, kupovine i rezervacije.\nPošaljite poruku i javićemo se u najkraćem roku.',
    ctaBadge: 'Premium ponuda • Preševo',
    ctaPrimary: 'Kontaktirajte nas',
    ctaCall: 'Pozovi direktno',
    dealerTitle: 'Kupujete i vozilo i poverenje placa.',
    dealerSub: 'Moj Auto Diler selektuje vozila za kupce koji zele jasnu istoriju, realno stanje i mirnu odluku pre kupovine.',
    dealerPillars: [
      ['Kako biramo vozila', 'Prednost imaju primerci sa jasnim poreklom, urednom dokumentacijom i stanjem koje mozemo da preporucimo.'],
      ['Profesionalno sourcing iskustvo', 'Pratimo uvozna trzista i biramo vozila koja imaju smisla za nase kupce, ne samo za oglas.'],
      ['Transparentan proces', 'Pre gledanja razgovaramo o stanju, troskovima, dokumentaciji i svemu sto utice na odluku.'],
    ],
  },
  sq: {
    eyebrow: 'Ofertë premium • Preševo',
    title: 'Automjete premium, te verifikuara.',
    lead: 'Automjete premium të përzgjedhura me kujdes nga importi jashtë vendit, me gjendje të verifikuar dhe blerje të sigurt pa presion.',
    primary: 'Shiko automjetet',
    secondary: 'Rezervo shikim',
    heroNote: 'Seleksion diskret automjetesh premium ne Serbi, me histori te dokumentuar dhe kontroll para shitjes.',
    featuredLabel: 'Ofertë e zgjedhur',
    verifiedLine: 'Origjine, servis dhe gjendje e verifikuar',
    viewDetails: 'Shiko detajet',
    stats: [
      ['100+', 'automjete te shitura ne 2 vitet e fundit'],
      ['5.0', 'vleresim nga bleresit'],
      ['100%', 'bleres te kenaqur pas dorezimit'],
      ['24h', 'pergjigje e shpejte per shikim'],
    ],
    trustTitle: 'Blerje me me shume siguri',
    trustSub: 'Cdo detaj eshte vendosur qe bleresi te kete pamje te qarte para vendimit.',
    trust: [
      ['Auto plac i besuar ne Serbi', 'Reputacion i konfirmuar nga bleresit dhe recenzionet publike.', ShieldCheck],
      ['Histori transparente', 'Origjina, servisi dhe gjendja komunikohen pa kosto te fshehura.', ClipboardCheck],
      ['Kontroll profesional', 'Automjetet kontrollohen para shitjes dhe para rekomandimit.', Wrench],
      ['Mbeshtetje deri ne dorezim', 'Shikim i automjetit, test vozitje, dokumentacion dhe kontroll teknik.', KeyRound],
    ],
    featuredTitle: 'Seleksioni aktual premium',
    featuredSub: 'Automjete premium te disponueshme ne Serbi. Cdo shpallje hap detajet dhe kontaktin direkt.',
    viewAll: 'Shiko gjithe oferten',
    darkTitle: 'Vendim i qete para blerjes.',
    darkAccent: 'para blerjes',
    darkEyebrow: 'Proces besimi',
    darkSub: 'Flasim per gjendjen, kostot reale dhe historine e automjetit para nenshkrimit. Kjo eshte diferenca mes shitjes se zakonshme dhe partnerit te besueshem.',
    darkCards: [
      ['Kontroll dokumentacioni', 'Kontrollojme dokumentacionin, historine e servisit dhe origjinen e automjetit.', ClipboardCheck],
      ['Kontroll i karrocerise dhe interierit', 'Shikojme pjesen e jashtme dhe te brendshme per detaje te rendesishme para blerjes.', Car],
      ['Vleresim gjendjeje dhe rekomandim', 'Japim vleresim real dhe rekomandim te sinqerte - pa presion dhe pa surpriza.', ShieldCheck],
    ],
    darkTrustStrip: ['Transparente dhe sinqerte', 'Eksperience qe kursen kohe dhe para', 'Pa surpriza te pakendshme', 'Partneri juaj i besuar'],
    reviewsTitle: 'Pershtypjet e bleresve',
    reviewsSub: 'Recensione te shkurtra nga bleres qe kaluan procesin nga thirrja e pare deri te dorezimi.',
    reviews: [
      ['Excellent experience from first contact to delivery.', 'Milan P.', 'Verified buyer'],
      ['Gjithcka ishte transparente, pa presion dhe pa kosto te fshehura.', 'Jelena M.', 'PolovniAutomobili review'],
      ['Automjeti ishte sakte si ne pershkrim. Marrveshja dhe dorezimi ishin profesionale.', 'Arben K.', 'Verified buyer'],
    ],
    ctaTitle: 'Gati per shikim?',
    ctaSub: 'Jemi këtu për çdo pyetje rreth automjeteve, blerjes dhe rezervimit.\nDërgoni mesazh dhe do t\'ju përgjigjemi sa më shpejt.',
    ctaBadge: 'Ofertë premium • Preševo',
    ctaPrimary: 'Kontakto placin',
    ctaCall: 'Telefono direkt',
    dealerTitle: 'Bleni edhe automjetin, edhe besimin e placit.',
    dealerSub: 'Moj Auto Diler zgjedh automjete per bleres qe duan histori te qarte, gjendje reale dhe vendim te qete para blerjes.',
    dealerPillars: [
      ['Si i zgjedhim automjetet', 'Prioritet kane automjetet me origjine te qarte, dokumentacion dhe gjendje qe mund ta rekomandojme.'],
      ['Sourcing profesional', 'Ndjekim tregjet e importit dhe zgjedhim automjete qe kane vlere per bleresin, jo vetem per shpalljen.'],
      ['Proces transparent', 'Para shikimit flasim per gjendjen, kostot, dokumentet dhe cdo gje qe ndikon ne vendim.'],
    ],
  },
} satisfies Record<Locale, {
  eyebrow: string;
  title: string;
  lead: string;
  primary: string;
  secondary: string;
  heroNote: string;
  featuredLabel: string;
  verifiedLine: string;
  viewDetails: string;
  stats: [string, string][];
  trustTitle: string;
  trustSub: string;
  trust: [string, string, React.ElementType][];
  featuredTitle: string;
  featuredSub: string;
  viewAll: string;
  darkTitle: string;
  darkAccent: string;
  darkEyebrow: string;
  darkSub: string;
  darkCards: [string, string, React.ElementType][];
  darkTrustStrip: string[];
  reviewsTitle: string;
  reviewsSub: string;
  reviews: [string, string, string][];
  ctaTitle: string;
  ctaSub: string;
  ctaBadge: string;
  ctaPrimary: string;
  ctaCall: string;
  dealerTitle: string;
  dealerSub: string;
  dealerPillars: [string, string][];
}>;

export default async function HomePage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const currentLocale = locale;
  const t = getTranslations(currentLocale);
  const copy = homeCopy[currentLocale];
  const [dealer, heroVehicle, featuredVehicles] = await Promise.all([
    getDealerSettings(),
    getHeroVehicle(),
    getShowcaseVehicles(8),
  ]);
  const darkTitleParts = copy.darkTitle.split(copy.darkAccent);

  return (
    <>
      <DealerJsonLd dealer={dealer} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-[calc(6.15rem+env(safe-area-inset-top))] min-[390px]:pt-[calc(6.35rem+env(safe-area-inset-top))] sm:pt-24 lg:pt-32">
        <HeroParallaxImage />
        {/* Soft white wash keeps the hero image subtle behind glass surfaces. */}
        <div className="absolute inset-0 bg-white/66 sm:bg-white/78" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/14" />

        <div className="relative mx-auto grid max-w-7xl gap-4 px-3 pb-8 min-[390px]:gap-5 min-[390px]:px-4 sm:gap-10 sm:px-6 sm:pb-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16 lg:pb-24">

          {/* ── Text card ── */}
          <div className="rounded-2xl border border-white/60 bg-white/82 p-4 shadow-[0_8px_28px_rgba(15,15,20,0.07)] backdrop-blur-md min-[390px]:p-5 sm:rounded-[32px] sm:border-white/70 sm:bg-white/72 sm:p-7 sm:shadow-[0_24px_70px_rgba(15,15,20,0.08)] lg:p-8">

            {/* Eyebrow */}
            <Reveal delay={80} className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-dark)] min-[390px]:px-3 min-[390px]:text-[11px] sm:mb-6 sm:px-4 sm:py-2">
              <Car size={13} />
              {copy.eyebrow}
            </Reveal>

            {/* H1 — scaled down on mobile to avoid overflow */}
            <Reveal delay={170} className="max-w-[760px]">
              <h1 className="text-balance text-[1.68rem] font-black leading-[1.1] text-[var(--color-text)] min-[360px]:text-[1.78rem] min-[390px]:text-[1.85rem] sm:text-5xl lg:text-[3.35rem] xl:text-[3.95rem]">
                {copy.title}
              </h1>
            </Reveal>

            {/* Lead */}
            <Reveal delay={260}>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] min-[390px]:mt-4 min-[390px]:leading-7 sm:mt-6 sm:text-lg sm:leading-8">
                {copy.lead}
              </p>
            </Reveal>

            {/* CTAs — full-width on mobile, auto on sm+ */}
            <Reveal delay={360} className="mt-5 flex flex-col gap-2.5 min-[390px]:gap-3 sm:mt-9 sm:flex-row">
              <Link
                href={`/${currentLocale}/inventory`}
                className="btn-gold inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm min-[390px]:min-h-12 min-[390px]:px-6 sm:min-h-[3.25rem] sm:w-auto sm:px-7"
              >
                {copy.primary}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`/${currentLocale}/contact`}
                className="btn-outline inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm min-[390px]:min-h-12 min-[390px]:px-6 sm:min-h-[3.25rem] sm:w-auto sm:px-7"
              >
                {copy.secondary}
                <ChevronRight size={16} />
              </Link>
            </Reveal>

            {/* Stats — 2×2 compact on mobile, 1×4 on sm+ */}
            <div className="mt-5 grid grid-cols-2 gap-1.5 min-[390px]:gap-2 sm:mt-9 sm:max-w-xl sm:grid-cols-4 sm:gap-3">
              {copy.stats.map(([value, label], index) => (
                <Reveal
                  key={label}
                  delay={430 + index * 80}
                  className="rounded-xl border border-[var(--color-border)] bg-white/80 p-2.5 shadow-sm min-[390px]:p-3 sm:rounded-2xl sm:p-4"
                >
                  <div className="text-lg font-black text-[var(--color-text)] min-[390px]:text-xl sm:text-2xl">{value}</div>
                  {value === '5.0' ? (
                    <>
                      <div className="mt-1 flex items-center gap-[3px]">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={10} fill="currentColor" className="text-[var(--accent)]" />
                        ))}
                      </div>
                      <p className="mt-0.5 text-[10px] leading-[1.3] text-[var(--color-text-muted)] sm:text-[11px] sm:leading-4">{label}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-[10px] leading-[1.3] text-[var(--color-text-muted)] sm:mt-2 sm:text-[11px] sm:leading-4">{label}</p>
                  )}
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── Featured vehicle card ── */}
          {heroVehicle && (
            <Reveal delay={260}>
              <HeroVehicleCard
                vehicle={heroVehicle}
                locale={currentLocale}
                t={t}
                featuredLabel={copy.featuredLabel}
                verifiedLine={copy.verifiedLine}
                viewLabel={copy.viewDetails}
              />
            </Reveal>
          )}
        </div>
      </section>

      <div className="flex flex-col">
        <section className="order-1 bg-[var(--color-bg)] py-12 min-[390px]:py-14 sm:order-2 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex flex-col gap-4 min-[390px]:mb-10 min-[390px]:gap-5 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <SectionHeader title={copy.featuredTitle} subtitle={copy.featuredSub} />
              </Reveal>
              <Link href={`/${currentLocale}/inventory`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-dark)] transition hover:text-[var(--accent)]">
                {copy.viewAll}
                <ArrowRight size={16} />
              </Link>
            </div>
            {featuredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {featuredVehicles.map((vehicle, index) => (
                  <Reveal key={vehicle.id} delay={index * 85}>
                    <VehicleCard vehicle={vehicle} locale={currentLocale} t={t} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-(--color-text-muted)">
                Nema dostupnih vozila. Dodajte vozila kroz admin panel.
              </p>
            )}
          </div>
        </section>

        <section className="order-2 bg-white py-12 min-[390px]:py-14 sm:order-1 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <SectionHeader title={copy.trustTitle} subtitle={copy.trustSub} />
            </Reveal>
            <div className="mt-8 grid gap-3 min-[390px]:mt-10 min-[390px]:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {copy.trust.map(([title, text, Icon], index) => (
              <Reveal key={title} delay={index * 90} className="luxury-trust-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm min-[390px]:p-6">
                <div className="trust-card-icon mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] min-[390px]:mb-6 min-[390px]:h-11 min-[390px]:w-11">
                    <Icon size={21} />
                  </div>
                  <h3 className="text-lg font-black text-[var(--color-text)]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="relative isolate overflow-hidden bg-[#11100E] py-16 text-white min-[390px]:py-20 sm:py-24">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/test_11.jpg"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-90 saturate-[1.08] contrast-[1.04]"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/videos/mojautodiler-premium-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[#11100E]/24" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,16,14,0.90)_0%,rgba(17,16,14,0.58)_38%,rgba(17,16,14,0.18)_64%,rgba(17,16,14,0.46)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(201,168,76,0.28),transparent_27%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(180deg,rgba(17,16,14,0.28)_0%,rgba(17,16,14,0.08)_42%,rgba(17,16,14,0.78)_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-[#11100E]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[#11100E]/90 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:min-h-[24rem] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-16">
            <Reveal className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.08] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/76 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)]" />
                {copy.darkEyebrow}
              </div>
              <h2 className="max-w-2xl text-3xl font-black leading-tight !text-white drop-shadow-[0_4px_22px_rgba(0,0,0,0.34)] min-[390px]:text-4xl sm:text-5xl">
                {darkTitleParts[0]}
                <span className="text-[var(--accent)]">{copy.darkAccent}</span>
                {darkTitleParts[1]}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] min-[390px]:mt-6 min-[390px]:text-base min-[390px]:leading-8">{copy.darkSub}</p>
            </Reveal>

            <div className="hidden min-h-[18rem] rounded-[2rem] border border-white/0 lg:block" aria-hidden="true" />
          </div>

          <div className="mt-5 grid gap-3 min-[390px]:mt-6 md:grid-cols-3 lg:mt-10 lg:gap-4">
            {copy.darkCards.map(([title, text, Icon], index) => (
              <Reveal key={title} delay={180 + index * 120} className="group relative min-h-[13rem] overflow-hidden rounded-[1.75rem] border border-white/18 bg-[#12110F]/42 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.30)] backdrop-blur-xl transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:inset-0 before:bg-[linear-gradient(150deg,rgba(255,255,255,0.18),transparent_42%,rgba(201,168,76,0.12))] before:opacity-75 before:transition-opacity before:duration-1000 before:ease-[cubic-bezier(0.22,1,0.36,1)] min-[390px]:min-h-[14rem] sm:p-6 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-px motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:border-white/22 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#13110F]/45 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_25px_82px_rgba(0,0,0,0.32)] motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:before:opacity-82">
                <div className="relative flex h-full flex-col">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <span className="text-4xl font-black leading-none text-white/18 transition-colors duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-5xl motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-[var(--accent)]/32">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent)]/16 text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_28px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-14 sm:w-14 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:border-[var(--accent)]/35 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-[var(--accent)]/19 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.17),0_11px_29px_rgba(0,0,0,0.23)]">
                      <Icon size={23} />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-lg font-black leading-tight !text-white">{title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/72">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-5 grid gap-2 rounded-3xl border border-white/14 bg-white/[0.08] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl min-[390px]:p-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.darkTrustStrip.map((item, index) => (
              <Reveal key={item} delay={520 + index * 70} className="flex items-center gap-2 rounded-2xl px-2 py-2 text-sm font-bold text-white/82">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent)]/14 text-[var(--accent)]">
                  <CheckCircle2 size={14} />
                </span>
                {item}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 min-[390px]:py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 min-[390px]:gap-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="divider-gold mb-5" />
            <h2 className="max-w-2xl text-2xl font-black leading-tight text-[var(--color-text)] min-[390px]:text-3xl sm:text-4xl">{copy.dealerTitle}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-muted)] min-[390px]:mt-5 sm:text-base sm:leading-8">{copy.dealerSub}</p>
            <TrustBadges locale={currentLocale} badges={['dealer', 'transparent', 'inspection', 'swiss']} className="mt-6" />
          </Reveal>
          <div className="grid gap-3">
            {copy.dealerPillars.map(([title, text], index) => (
              <Reveal key={title} delay={index * 90} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition hover:border-[var(--accent-border)] hover:shadow-[0_16px_42px_rgba(15,15,20,0.08)] min-[390px]:p-5">
                <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent-dark)]">0{index + 1}</div>
                <h3 className="text-lg font-black text-[var(--color-text)]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 min-[390px]:py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeader title={copy.reviewsTitle} subtitle={copy.reviewsSub} centered />
          </Reveal>
          <div className="mt-8 grid gap-3 min-[390px]:mt-10 min-[390px]:gap-4 lg:grid-cols-3">
            {copy.reviews.map(([quote, name, source], index) => (
              <Reveal key={`${name}-${source}`} delay={index * 90} className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-sm min-[390px]:p-6">
                <div className="mb-5 flex items-center gap-1 text-[var(--accent)]">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                    <Star key={`star-${n}`} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg leading-8 text-[var(--color-text)]">&ldquo;{quote}&rdquo;</p>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                  <div>
                    <p className="font-bold text-[var(--color-text)]">{name}</p>
                  </div>
                  <Award size={22} className="text-[var(--accent)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg)] px-3 py-12 min-[390px]:px-4 min-[390px]:py-16 sm:px-6 sm:py-20">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_24px_70px_rgba(15,15,20,0.1)] min-[390px]:rounded-[34px] min-[390px]:p-7 sm:p-10 lg:p-12">
          <Image
            src="/mojautodiler_front.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 72rem, 100vw"
            className="pointer-events-none object-cover object-center opacity-[0.18] blur-[1px]"
          />
          <div className="pointer-events-none absolute inset-0 bg-white/78 sm:bg-white/82" />
          <div className="pointer-events-none absolute inset-0 bg-[var(--color-bg)]/8" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--accent-dark)]">
                <CalendarCheck size={15} />
                {copy.ctaBadge}
              </div>
              <h2 className="max-w-2xl text-3xl font-black leading-tight text-[var(--color-text)] min-[390px]:text-4xl sm:text-5xl">{copy.ctaTitle}</h2>
              <p className="mt-4 max-w-xl whitespace-pre-line text-sm leading-7 text-[var(--color-text-muted)] min-[390px]:mt-5 min-[390px]:text-base min-[390px]:leading-8">{copy.ctaSub}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={`/${currentLocale}/contact`} className="btn-gold inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl px-7 text-sm">
                {copy.ctaPrimary}
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function SectionHeader({ title, subtitle, centered = false }: { readonly title: string; readonly subtitle: string; readonly centered?: boolean }) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <div className={centered ? 'divider-gold mx-auto mb-4' : 'divider-gold mb-4'} />
      <h2 className="text-3xl font-black leading-tight text-[var(--color-text)] sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">{subtitle}</p>
    </div>
  );
}
