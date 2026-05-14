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
  Phone,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react';
import DealerJsonLd from '@/components/seo/DealerJsonLd';
import HeroParallaxImage from '@/components/ui/HeroParallaxImage';
import Reveal from '@/components/ui/Reveal';
import HeroVehicleCard from '@/components/vehicle/HeroVehicleCard';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { getDealerInfo, mockVehicles } from '@/data/vehicles';
import { getFeaturedVehicles } from '@/lib/db/vehicles';
import { getTranslations, isValidLocale, Locale } from '@/lib/i18n';

const homeCopy = {
  sr: {
    eyebrow: 'Premium auto salon • Preševo',
    title: 'Premium automobili sa transparentnom istorijom.',
    lead: 'Pažljivo odabrana premium vozila iz uvoza iz Švajcarske, uz provereno stanje i sigurnu kupovinu bez pritiska.',
    primary: 'Pregledaj vozila',
    secondary: 'Zakazi razgledanje',
    heroNote: 'Diskretna selekcija premium vozila u Preševu, sa dokumentovanom istorijom i pregledom pre prodaje.',
    featuredLabel: 'Izdvojena ponuda',
    verifiedLine: 'Provereno poreklo, servis i stanje',
    viewDetails: 'Pogledaj detalje',
    stats: [
      ['100+', 'vozila prodato u poslednje 2 godine'],
      ['5.0', 'ocena kupaca na PolovniAutomobili'],
      ['100%', 'zadovoljnih kupaca nakon isporuke'],
      ['24h', 'brz odgovor za pregled vozila'],
    ],
    trustTitle: 'Kupovina sa vise sigurnosti',
    trustSub: 'Svaki detalj je postavljen da kupac dobije jasnu sliku pre odluke.',
    trust: [
      ['Pouzdan salon u Preševu', 'Lokalna reputacija za jug Srbije, potvrdjena kroz kupce i javne recenzije.', ShieldCheck],
      ['Transparentna istorija', 'Poreklo, servis i stanje komuniciramo bez skrivenih stavki.', ClipboardCheck],
      ['Profesionalna provera', 'Vozila se pregledaju pre prodaje i pre preporuke kupcu.', Wrench],
      ['Podrska do isporuke', 'Razgledanje, probna voznja, dokumentacija i tehnicki pregled.', KeyRound],
    ],
    featuredTitle: 'Aktuelna premium selekcija',
    featuredSub: 'Premium vozila dostupna u Preševu. Svaki oglas vodi ka detaljima i direktnom kontaktu.',
    viewAll: 'Pogledaj celu ponudu',
    darkTitle: 'Mirna odluka pre kupovine.',
    darkSub: 'Razgovaramo o stanju vozila, realnim troskovima i istoriji pre nego sto dodjete do potpisa. To je razlika izmedju obicne prodaje i pouzdanog partnera.',
    darkPoints: ['Provera dokumentacije', 'Pregled karoserije i enterijera', 'Procena stanja i preporuka'],
    reviewsTitle: 'Utisci kupaca',
    reviewsSub: 'Kratke recenzije kupaca koji su prosli kroz ceo proces od prvog poziva do isporuke.',
    reviews: [
      ['Excellent experience from first contact to delivery.', 'Milan P.', 'Verified buyer'],
      ['Sve je bilo transparentno, bez pritiska i bez skrivenih troskova.', 'Jelena M.', 'PolovniAutomobili review'],
      ['Auto je bio tacno kao u opisu. Dogovor i preuzimanje su prosli profesionalno.', 'Arben K.', 'Verified buyer'],
    ],
    ctaTitle: 'Spremni za razgledanje?',
    ctaSub: 'Posaljite upit za konkretno vozilo ili pozovite salon. Odgovor dobijate brzo, jasno i bez obaveze.',
    ctaPrimary: 'Kontaktirajte nas',
    ctaCall: 'Pozovi direktno',
  },
  sq: {
    eyebrow: 'Autosallon premium • Preševo',
    title: 'Automjete premium, te verifikuara.',
    lead: 'Automjete premium të përzgjedhura me kujdes nga importi i Zvicrës, me gjendje të verifikuar dhe blerje të sigurt pa presion.',
    primary: 'Shiko automjetet',
    secondary: 'Rezervo shikim',
    heroNote: 'Seleksion diskret automjetesh premium ne Preševo, me histori te dokumentuar dhe kontroll para shitjes.',
    featuredLabel: 'Ofertë e zgjedhur',
    verifiedLine: 'Origjine, servis dhe gjendje e verifikuar',
    viewDetails: 'Shiko detajet',
    stats: [
      ['100+', 'automjete te shitura ne 2 vitet e fundit'],
      ['5.0', 'vleresim nga bleresit ne PolovniAutomobili'],
      ['98%', 'bleres te kenaqur pas dorezimit'],
      ['24h', 'pergjigje e shpejte per shikim'],
    ],
    trustTitle: 'Blerje me me shume siguri',
    trustSub: 'Cdo detaj eshte vendosur qe bleresi te kete pamje te qarte para vendimit.',
    trust: [
      ['Autosallon i besuar ne Preševo', 'Reputacion lokal per jugun e Serbise, i konfirmuar nga bleresit dhe recenzionet publike.', ShieldCheck],
      ['Histori transparente', 'Origjina, servisi dhe gjendja komunikohen pa kosto te fshehura.', ClipboardCheck],
      ['Kontroll profesional', 'Automjetet kontrollohen para shitjes dhe para rekomandimit.', Wrench],
      ['Mbeshtetje deri ne dorezim', 'Shikim i automjetit, test vozitje, dokumentacion dhe kontroll teknik.', KeyRound],
    ],
    featuredTitle: 'Seleksioni aktual premium',
    featuredSub: 'Automjete premium te disponueshme ne Preševo. Cdo shpallje hap detajet dhe kontaktin direkt.',
    viewAll: 'Shiko gjithe oferten',
    darkTitle: 'Vendim i qete para blerjes.',
    darkSub: 'Flasim per gjendjen, kostot reale dhe historine e automjetit para nenshkrimit. Kjo eshte diferenca mes shitjes se zakonshme dhe partnerit te besueshem.',
    darkPoints: ['Kontroll dokumentacioni', 'Kontroll i karrocerise dhe interierit', 'Vleresim gjendjeje dhe rekomandim'],
    reviewsTitle: 'Pershtypjet e bleresve',
    reviewsSub: 'Recensione te shkurtra nga bleres qe kaluan procesin nga thirrja e pare deri te dorezimi.',
    reviews: [
      ['Excellent experience from first contact to delivery.', 'Milan P.', 'Verified buyer'],
      ['Gjithcka ishte transparente, pa presion dhe pa kosto te fshehura.', 'Jelena M.', 'PolovniAutomobili review'],
      ['Automjeti ishte sakte si ne pershkrim. Marrveshja dhe dorezimi ishin profesionale.', 'Arben K.', 'Verified buyer'],
    ],
    ctaTitle: 'Gati per shikim?',
    ctaSub: 'Dergo kerkese per automjet konkret ose telefono sallonin. Pergjigja eshte e shpejte, e qarte dhe pa detyrim.',
    ctaPrimary: 'Kontakto sallonin',
    ctaCall: 'Telefono direkt',
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
  darkSub: string;
  darkPoints: string[];
  reviewsTitle: string;
  reviewsSub: string;
  reviews: [string, string, string][];
  ctaTitle: string;
  ctaSub: string;
  ctaPrimary: string;
  ctaCall: string;
}>;

export default async function HomePage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const currentLocale = locale;
  const t = getTranslations(currentLocale);
  const copy = homeCopy[currentLocale];
  const dealer = getDealerInfo();
  const featuredVehiclesFromDb = await getFeaturedVehicles(4);
  const featuredVehicles = featuredVehiclesFromDb.length
    ? featuredVehiclesFromDb
    : mockVehicles.filter((v) => v.status === 'active' && v.featured).slice(0, 4);
  const heroVehicle =
    featuredVehicles[0] ??
    mockVehicles.find((v) => v.status === 'active') ??
    mockVehicles[0];

  return (
    <>
      <DealerJsonLd dealer={dealer} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-[calc(6.25rem+env(safe-area-inset-top))] sm:pt-24 lg:pt-32">
        <HeroParallaxImage />
        {/* Mobile: lighter overlay so background image gives atmosphere */}
        <div className="absolute inset-0 bg-white/52 sm:bg-white/72" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/10" />

        <div className="relative mx-auto grid max-w-7xl gap-5 px-4 pb-8 sm:gap-10 sm:px-6 sm:pb-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16 lg:pb-24">

          {/* ── Text card ── */}
          <div className="rounded-2xl border border-white/60 bg-white/82 p-5 shadow-[0_8px_28px_rgba(15,15,20,0.07)] backdrop-blur-md sm:rounded-[32px] sm:border-white/70 sm:bg-white/72 sm:p-7 sm:shadow-[0_24px_70px_rgba(15,15,20,0.08)] lg:p-8">

            {/* Eyebrow */}
            <Reveal delay={80} className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-dark)] sm:mb-6 sm:px-4 sm:py-2">
              <Car size={13} />
              {copy.eyebrow}
            </Reveal>

            {/* H1 — scaled down on mobile to avoid overflow */}
            <Reveal delay={170} className="max-w-[760px]">
              <h1 className="text-balance text-[1.85rem] font-black leading-[1.1] text-[var(--color-text)] sm:text-5xl lg:text-[3.35rem] xl:text-[3.95rem]">
                {copy.title}
              </h1>
            </Reveal>

            {/* Lead */}
            <Reveal delay={260}>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] sm:mt-6 sm:text-lg sm:leading-8">
                {copy.lead}
              </p>
            </Reveal>

            {/* CTAs — full-width on mobile, auto on sm+ */}
            <Reveal delay={360} className="mt-5 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                href={`/${currentLocale}/inventory`}
                className="btn-gold inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm sm:min-h-13 sm:w-auto sm:px-7"
              >
                {copy.primary}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`/${currentLocale}/contact`}
                className="btn-outline inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm sm:min-h-13 sm:w-auto sm:px-7"
              >
                {copy.secondary}
                <ChevronRight size={16} />
              </Link>
            </Reveal>

            {/* Stats — 2×2 compact on mobile, 1×4 on sm+ */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-9 sm:max-w-xl sm:grid-cols-4 sm:gap-3">
              {copy.stats.map(([value, label], index) => (
                <Reveal
                  key={label}
                  delay={430 + index * 80}
                  className="rounded-xl border border-[var(--color-border)] bg-white/80 p-3 shadow-sm sm:rounded-2xl sm:p-4"
                >
                  <div className="text-xl font-black text-[var(--color-text)] sm:text-2xl">{value}</div>
                  <p className="mt-1 text-[10px] leading-[1.3] text-[var(--color-text-muted)] sm:mt-2 sm:text-[11px] sm:leading-4">{label}</p>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── Featured vehicle card ── */}
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
        </div>
      </section>

      <div className="flex flex-col">
        <section className="order-1 bg-[var(--color-bg)] py-16 sm:order-2 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <SectionHeader title={copy.featuredTitle} subtitle={copy.featuredSub} />
              </Reveal>
              <Link href={`/${currentLocale}/inventory`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-dark)] transition hover:text-[var(--accent)]">
                {copy.viewAll}
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featuredVehicles.map((vehicle, index) => (
                <Reveal key={vehicle.id} delay={index * 85}>
                  <VehicleCard vehicle={vehicle} locale={currentLocale} t={t} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="order-2 bg-white py-16 sm:order-1 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <SectionHeader title={copy.trustTitle} subtitle={copy.trustSub} />
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {copy.trust.map(([title, text, Icon], index) => (
                <Reveal key={title} delay={index * 90} className="luxury-trust-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
                  <div className="trust-card-icon mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
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

      <section className="relative overflow-hidden bg-[#11100E] py-20 text-white sm:py-24">
        <Image
          src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1800&q=82"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-[#11100E]/72" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal>
            <div className="divider-gold mb-5" />
            <h2 className="max-w-2xl text-4xl font-black leading-tight !text-white sm:text-5xl">{copy.darkTitle}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/72">{copy.darkSub}</p>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-3">
            {copy.darkPoints.map((point, index) => (
              <Reveal key={point} delay={index * 90} className="rounded-3xl border border-white/15 bg-white/[0.09] p-5 backdrop-blur-sm">
                <div className="mb-5 text-sm font-black text-white/45">0{index + 1}</div>
                <CheckCircle2 size={20} className="mb-3 text-[var(--accent)]" />
                <p className="text-sm font-bold leading-6 !text-white">{point}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeader title={copy.reviewsTitle} subtitle={copy.reviewsSub} centered />
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {copy.reviews.map(([quote, name, source], index) => (
              <Reveal key={`${name}-${source}`} delay={index * 90} className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-1 text-[var(--accent)]">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                    <Star key={`star-${n}`} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg leading-8 text-[var(--color-text)]">&ldquo;{quote}&rdquo;</p>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                  <div>
                    <p className="font-bold text-[var(--color-text)]">{name}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{source}</p>
                  </div>
                  <Award size={22} className="text-[var(--accent)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg)] px-4 py-16 sm:px-6 sm:py-20">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-white p-7 shadow-[0_24px_70px_rgba(15,15,20,0.1)] sm:p-10 lg:p-12">
          <Image
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=80"
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none object-cover opacity-[0.045] blur-[1px]"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--accent-dark)]">
                <CalendarCheck size={15} />
                Preševo premium viewing
              </div>
              <h2 className="max-w-2xl text-4xl font-black leading-tight text-[var(--color-text)] sm:text-5xl">{copy.ctaTitle}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-muted)]">{copy.ctaSub}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={`/${currentLocale}/contact`} className="btn-gold inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-7 text-sm">
                {copy.ctaPrimary}
                <ArrowRight size={17} />
              </Link>
              <a href={`tel:${dealer.phone}`} className="btn-outline inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-7 text-sm">
                <Phone size={17} />
                {copy.ctaCall}
              </a>
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
