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
import CarVerticalHomepageSection from '@/components/affiliate/CarVerticalHomepageSection';
import HeroParallaxImage from '@/components/ui/HeroParallaxImage';
import Reveal from '@/components/ui/Reveal';
import HeroVehicleCard from '@/components/vehicle/HeroVehicleCard';
import { TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { getDealerSettings } from '@/lib/db/settings';
import { getHeroVehicle, getShowcaseVehicles } from '@/lib/db/vehicles';
import { getTranslations, isValidLocale, Locale } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site-url';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const isSq = locale === 'sq';
  const title = isSq
    ? 'Automjete Premium nga Importi | Moj Auto Diler'
    : 'Premium automobili iz uvoza | Moj Auto Diler';
  return {
    title: { absolute: title },
    description: isSq
      ? 'Automjete premium të zgjedhura me kujdes nga importi, me histori transparente dhe blerje të sigurt pa presion në Serbi.'
      : 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom, dokumentovanim stanjem i sigurnom kupovinom bez pritiska u Srbiji.',
    // max-image-preview:large is required for Google Discover image eligibility
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: { sr: '/sr', sq: '/sq', 'x-default': '/sr' },
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/${locale}`,
      title,
      description: isSq
        ? 'Automjete premium me histori transparente dhe blerje të sigurt.'
        : 'Premium automobili iz uvoza sa transparentnom istorijom i sigurnom kupovinom.',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Moj Auto Diler, premium automobili iz uvoza' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isSq
        ? 'Automjete Premium | Moj Auto Diler'
        : 'Premium automobili | Moj Auto Diler',
      description: isSq
        ? 'Automjete premium me histori transparente. Blerje e sigurt në Serbi.'
        : 'Premium automobili sa transparentnom istorijom. Sigurna kupovina u Srbiji.',
      images: ['/og-image.jpg'],
    },
  };
}

const homeCopy = {
  sr: {
    eyebrow: 'Kupujte sigurnije',
    titleLine1: 'Manje rizika.',
    titleBadge: 'VIŠE',
    titleLine2: 'poverenja.',
    lead: 'Pažljivo odabrani polovni automobili, transparentne informacije i korisni saveti za sigurniji izbor. Pronađite vozilo koje vam odgovara.',
    primary: 'Pregledaj vozila',
    secondary: 'Zakazi razgledanje',
    heroNote: 'Pažljivo odabrana ponuda polovnih automobila na jednom mestu, uz informacije koje vam pomažu da donesete bolju odluku.',
    featuredLabel: 'Izdvojena ponuda',
    verifiedLine: 'Informacije za lakši izbor vozila',
    viewDetails: 'Pogledaj detalje',
    stats: [
      ['Odabrana ponuda', 'Partnerski auto-placevi'],
      ['Transparentno', 'Dostupne informacije'],
      ['Direktan kontakt', 'Sa prodavcem vozila'],
      ['24/7 dostupno', 'Pregledajte ponudu'],
    ],
    trustTitle: 'Kupovina sa više sigurnosti',
    trustSub: 'Svaki detalj je postavljen da kupac dobije jasnu sliku pre odluke.',
    trust: [
      ['Partnerski auto-placevi', 'Na jednom mestu predstavljamo ponudu odabranih partnerskih auto-placeva.', ShieldCheck],
      ['Transparentne informacije', 'Pregledajte dostupne podatke, karakteristike i fotografije pre nego što kontaktirate prodavca.', ClipboardCheck],
      ['Preporuka za proveru', 'Proverite istoriju i tehničko stanje vozila pre donošenja konačne odluke.', Wrench],
      ['Podrška do preporuke', 'Olakšavamo pronalaženje odgovarajućeg vozila i povezivanje sa prodavcem.', KeyRound],
    ],
    featuredTitle: 'Aktuelna premium selekcija',
    featuredSub: 'Istražite izdvojene automobile iz ponude naših partnerskih auto-placeva i pronađite model koji odgovara vašim potrebama i budžetu.',
    viewAll: 'Pogledaj celu ponudu',
    darkTitle: 'Mirna odluka pre kupovine.',
    darkAccent: 'pre kupovine',
    darkEyebrow: 'Proces poverenja',
    darkSub: 'Kupovina polovnog automobila počinje dobrim informacijama. Uporedite ponudu, upoznajte detalje vozila i proverite ono što vam je važno pre konačne odluke.',
    darkCards: [
      ['Pronađite odgovarajuće vozilo', 'Istražite pažljivo odabranu ponudu i izdvojite automobile koji odgovaraju vašim potrebama.', Car],
      ['Pregledajte informacije', 'Uporedite karakteristike, fotografije, cenu i dostupne podatke o vozilu.', ClipboardCheck],
      ['Proverite pre kupovine', 'Kontaktirajte prodavca i organizujte nezavisnu proveru vozila pre donošenja odluke.', ShieldCheck],
    ],
    darkTrustStrip: ['Transparentno i iskreno', 'Iskustvo koje stedi vreme i novac', 'Bez neprijatnih iznenadjenja', 'Vas pouzdan partner'],
    reviewsTitle: 'Utisci kupaca',
    reviewsSub: 'Iskustva posetilaca i kupaca koji su pronašli automobil i ostvarili kontakt sa prodavcem preko platforme.',
    reviews: [
      ['Odlično iskustvo pregleda ponude, sve informacije su bile jasne od prvog kontakta.', 'Milan P.', 'Korisnik platforme'],
      ['Sve je bilo transparentno, bez pritiska i sa jasnim podacima o vozilu.', 'Jelena M.', 'Korisnik platforme'],
      ['Pronašao sam odgovarajući auto, dogovor i gledanje sa placem su prošli profesionalno.', 'Arben K.', 'Korisnik platforme'],
    ],
    ctaTitle: 'Spremni za razgledanje?',
    ctaSub: 'Pronađite automobil koji vam odgovara, pregledajte dostupne informacije i kontaktirajte prodavca za više detalja.',
    ctaBadge: 'Premium ponuda',
    ctaPrimary: 'Kontaktirajte nas',
    ctaCall: 'Pozovi direktno',
    dealerTitle: 'Kupujete vozilo. Birate i prodavca.',
    dealerSub: 'Dobar izbor automobila počinje kvalitetnim informacijama i jasnom komunikacijom. MojAutoDiler povezuje ponudu partnerskih auto-placeva sa kupcima koji žele da istraže svoje mogućnosti pre kupovine.',
    dealerPillars: [
      ['Kako biramo ponudu', 'Predstavljamo vozila iz ponude partnerskih auto-placeva kako biste lakše pronašli opcije koje vam odgovaraju.'],
      ['Profesionalno iskustvo', 'Upoznajte ponudu prodavaca i kontaktirajte ih direktno za dodatne informacije o vozilu.'],
      ['Transparentan proces', 'Pregledajte dostupne informacije, postavite pitanja i dogovorite pregled vozila direktno sa prodavcem.'],
    ],
  },
  sq: {
    eyebrow: 'Blini me siguri',
    titleLine1: 'Më pak rrezik.',
    titleBadge: 'MË SHUMË',
    titleLine2: 'besim.',
    lead: 'Automjete të përdorura të zgjedhura me kujdes, informacione transparente dhe këshilla të dobishme për zgjedhje më të sigurt. Gjeni automjetin që ju përshtatet.',
    primary: 'Shiko automjetet',
    secondary: 'Rezervo shikim',
    heroNote: 'Ofertë e zgjedhur e automjeteve në një vend, me informacione që ju ndihmojnë të merrni vendim më të mirë.',
    featuredLabel: 'Ofertë e zgjedhur',
    verifiedLine: 'Informacione për zgjedhje më të lehtë',
    viewDetails: 'Shiko detajet',
    stats: [
      ['Ofertë e zgjedhur', 'Auto-place partnerë'],
      ['Transparente', 'Informacione të qasshme'],
      ['Kontakt direkt', 'Me shitësin e automjetit'],
      ['24/7 e qasshme', 'Shikoni ofertën'],
    ],
    trustTitle: 'Blerje me më shumë siguri',
    trustSub: 'Çdo detaj është vendosur që blerësi të ketë pamje të qartë para vendimit.',
    trust: [
      ['Auto-place partnerë', 'Në një vend prezantojmë ofertën e auto-placeve partnere të përzgjedhura.', ShieldCheck],
      ['Informacion transparent', 'Shikoni të dhënat, karakteristikat dhe fotot para se të kontaktoni shitësin.', ClipboardCheck],
      ['Rekomandim për kontroll', 'Kontrolloni historinë dhe gjendjen teknike të automjetit para marrjes së vendimit.', Wrench],
      ['Mbështetje deri te rekomandimi', 'Lehtësojmë gjetjen e automjetit të duhur dhe lidhjen me shitësin.', KeyRound],
    ],
    featuredTitle: 'Seleksioni aktual premium',
    featuredSub: 'Eksploroni automjetet e veçuara nga oferta e auto-placeve tona partnere dhe gjeni modelin e duhur për ju.',
    viewAll: 'Shiko gjithë ofertën',
    darkTitle: 'Vendim i qetë para blerjes.',
    darkAccent: 'para blerjes',
    darkEyebrow: 'Proces besimi',
    darkSub: 'Blerja e një automjeti të përdorur fillon me informacion të mirë. Krahasoni ofertën, njihuni me detajet dhe kontrolloni atë që është e rëndësishme për ju.',
    darkCards: [
      ['Gjeni automjetin e duhur', 'Eksploroni ofertën e përzgjedhur me kujdes dhe veçoni automjetet sipas nevojave tuaja.', Car],
      ['Shikoni informacionet', 'Krahasoni karakteristikat, fotot, çmimin dhe të dhënat e disponueshme të automjetit.', ClipboardCheck],
      ['Kontrolloni para blerjes', 'Kontaktoni shitësin dhe organizoni një kontroll të pavarur para marrjes së vendimit.', ShieldCheck],
    ],
    darkTrustStrip: ['Transparente dhe e sinqertë', 'Përvojë që kursen kohë dhe para', 'Pa surpriza të pakëndshme', 'Partneri juaj i besuar'],
    reviewsTitle: 'Përshtypjet e blerësve',
    reviewsSub: 'Përvoja të vizitorëve dhe blerësve që gjetën automjetin dhe vendosën kontakt me shitësin përmes platformës.',
    reviews: [
      ['Përvojë e shkëlqyer me shfletimin e ofertës, të gjitha informacionet ishin të qarta që nga kontakti i parë.', 'Milan P.', 'Përdorues i platformës'],
      ['Gjithçka ishte transparente, pa presion dhe me të dhëna të qarta për automjetin.', 'Jelena M.', 'Përdorues i platformës'],
      ['Gjeta makinën e duhur, marrëveshja dhe shikimi me autoplacin shkuan shumë profesionalisht.', 'Arben K.', 'Përdorues i platformës'],
    ],
    ctaTitle: 'Gati për shikim?',
    ctaSub: 'Gjeni automjetin që ju përshtatet, shikoni të dhënat e disponueshme dhe kontaktoni shitësin për më shumë detaje.',
    ctaBadge: 'Ofertë premium',
    ctaPrimary: 'Kontaktoni placin',
    ctaCall: 'Telefono direkt',
    dealerTitle: 'Bleni automjet. Zgjidhni edhe shitësin.',
    dealerSub: 'Zgjedhja e mirë e makinës fillon me informacion cilësor dhe komunikim të qartë. MojAutoDiler lidh ofertën e auto-placeve partnere me blerësit.',
    dealerPillars: [
      ['Si e zgjedhim ofertën', 'Prezantojmë automjete nga oferta e auto-placeve partnere që të gjeni më lehtë opsionet e përshtatshme.'],
      ['Përvojë profesionale', 'Njehuni me ofertën e shitësve dhe kontaktojini ata direkt për informata shtesë.'],
      ['Proces transparent', 'Shikoni të dhënat e disponueshme, bëni pyetje dhe lini takim për shikim direkt me shitësin.'],
    ],
  },
} satisfies Record<Locale, {
  eyebrow: string;
  titleLine1: string;
  titleBadge: string;
  titleLine2: string;
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

      {/* ── HERO + IZDVOJENA PONUDA flex wrapper ─────────────────────────────── */}
      {/* On mobile the flex order swaps them: featured first, hero second.    */}
      {/* On sm+ the featured block is sm:hidden so only hero renders (order-1). */}
      <div className="flex flex-col">

      {/* ── HERO — appears second on mobile (order-2), first on sm+ ─────────── */}
      <section className="relative order-2 overflow-hidden bg-white pt-[calc(4rem+env(safe-area-inset-top))] pb-9 min-[390px]:pb-10 sm:order-1 sm:pt-24 sm:pb-0 lg:pt-32">
        <HeroParallaxImage />
        {/* Soft white wash keeps the hero image subtle behind glass surfaces. */}
        <div className="absolute inset-0 bg-white/66 sm:bg-white/78" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/14" />

        <div className="relative mx-auto grid max-w-7xl gap-3 px-3 min-[390px]:gap-4 min-[390px]:px-4 sm:gap-10 sm:px-6 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-10 xl:gap-14 lg:pb-24">

          {/* ── Text card ── */}
          <div className="flex flex-col justify-center rounded-2xl border border-white/60 bg-white/82 p-3.5 shadow-[0_8px_28px_rgba(15,15,20,0.07)] backdrop-blur-md min-[390px]:p-4 sm:rounded-[32px] sm:border-white/70 sm:bg-white/72 sm:p-7 sm:shadow-[0_24px_70px_rgba(15,15,20,0.08)] lg:p-8">

            {/* Eyebrow — 32px gap to headline on desktop */}
            <Reveal delay={80} className="mb-4 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.11em] text-[var(--accent-dark)] min-[390px]:px-3 min-[390px]:text-[10px] sm:mb-8 sm:gap-2 sm:px-4 sm:py-2 sm:text-[11px]">
              <ShieldCheck size={12} />
              {copy.eyebrow}
            </Reveal>

            {/* H1 — "Manje rizika." then "VIŠE poverenja." on one baseline */}
            <Reveal delay={170} className="max-w-[760px]">
              <h1 style={{ fontFamily: 'var(--font-display)' }}>
                <span
                  className="block font-[800] text-[var(--color-text)] text-[1.25rem] min-[360px]:text-[1.35rem] min-[390px]:text-[1.5rem] sm:text-[clamp(2rem,3.6vw,2.8rem)] lg:text-[clamp(2.6rem,3.6vw,3.4rem)] xl:text-[clamp(3rem,3.6vw,4.5rem)]"
                  style={{ letterSpacing: '-0.03em', lineHeight: '1.05' }}
                >
                  {copy.titleLine1}
                </span>
                <span
                  className="hero-headline mt-0.5 flex items-baseline whitespace-nowrap sm:mt-1"
                  style={{ lineHeight: '0.9' }}
                >
                  <span
                    className="hero-vise font-[900] text-[var(--accent)] text-[2.1rem] min-[360px]:text-[2.4rem] min-[390px]:text-[2.75rem] sm:text-[4.5rem] lg:text-[5.75rem]"
                    style={{ letterSpacing: '-0.05em' }}
                  >
                    {copy.titleBadge}
                  </span>
                  <span
                    className="ml-[0.18em] font-[900] text-[var(--color-text)] text-[1.3rem] min-[360px]:text-[1.5rem] min-[390px]:text-[1.7rem] sm:text-[2.5rem] lg:text-[2.875rem]"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {copy.titleLine2}
                  </span>
                </span>
              </h1>
            </Reveal>

            {/* Lead — 28px gap from headline, larger readable type */}
            <Reveal delay={260} className="hidden sm:block">
              <p className="mt-5 max-w-2xl text-[1.125rem] leading-[1.6] text-[var(--color-text-muted)] sm:mt-7 sm:text-[1.25rem] lg:text-[1.35rem] [text-wrap:pretty]">
                {copy.lead}
              </p>
            </Reveal>

            {/* CTAs — 36px gap from description */}
            <Reveal delay={360} className="mt-4 flex flex-col gap-2 min-[390px]:gap-2.5 sm:mt-9 sm:flex-row">
              <Link
                href={`/${currentLocale}/inventory`}
                className="btn-gold inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm min-[390px]:min-h-11 min-[390px]:px-6 sm:min-h-[3.25rem] sm:w-auto sm:px-7"
              >
                {copy.primary}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`/${currentLocale}/contact`}
                className="btn-outline inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm min-[390px]:min-h-11 min-[390px]:px-6 sm:min-h-[3.25rem] sm:w-auto sm:px-7"
              >
                {copy.secondary}
                <ChevronRight size={16} />
              </Link>
            </Reveal>

            {/* Informational value cards */}
            <div className="mt-5 grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 min-[390px]:gap-2.5 sm:mt-8 sm:gap-3 lg:grid-cols-2 xl:grid-cols-4">
              {copy.stats.map(([title, subtitle], index) => (
                <Reveal
                  key={title}
                  delay={430 + index * 80}
                  className="h-full min-w-0"
                >
                  <div className="flex h-full min-w-0 flex-col justify-start rounded-xl border border-[var(--color-border)] bg-white/80 p-2.5 shadow-sm min-[390px]:p-3 sm:rounded-2xl sm:p-3.5">
                    <div className="font-bold tracking-tight text-[var(--color-text)] text-xs min-[390px]:text-sm sm:text-[14px] xl:text-[13px] 2xl:text-[14px] leading-snug break-words">
                      {title}
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-[var(--color-text-muted)] sm:mt-1.5 sm:text-xs sm:leading-relaxed break-words">
                      {subtitle}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── Featured vehicle card ── */}
          {/* hidden on mobile — the sm:hidden section below owns that slot with a proper heading */}
          {heroVehicle && (
            <Reveal delay={260} className="hidden sm:block">
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

      {/* ── IZDVOJENA PONUDA — appears first on mobile (order-1), hidden on sm+ */}
      {heroVehicle && (
        <section className="order-1 bg-[var(--color-bg)] pt-[calc(5.45rem+env(safe-area-inset-top))] min-[390px]:pt-[calc(5.75rem+env(safe-area-inset-top))] pb-4 sm:hidden">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-7 min-[390px]:mb-8">
              <Reveal>
                <SectionHeader title={copy.featuredLabel} subtitle={copy.heroNote} />
              </Reveal>
            </div>
            <Reveal delay={120}>
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
      )}

      </div>{/* end hero + izdvojena ponuda flex wrapper */}

      <CarVerticalHomepageSection locale={currentLocale} />

      {/* ── Aktuelna premium selekcija — rendered directly after the carVertical hero banner ── */}
      <section className="bg-[var(--color-bg)] py-9 min-[390px]:py-10 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-5 flex flex-col gap-3 min-[390px]:mb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <SectionHeader title={copy.featuredTitle} subtitle={copy.featuredSub} />
              </Reveal>
              <Link href={`/${currentLocale}/inventory`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-dark)] transition hover:text-[var(--accent)]">
                {copy.viewAll}
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* ── Brand silo quick-links (Phase 2 internal linking) ── */}
            <Reveal>
              <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {([
                  { slug: 'bmw',           label: 'BMW' },
                  { slug: 'audi',          label: 'Audi' },
                  { slug: 'volkswagen',    label: 'Volkswagen' },
                  { slug: 'mercedes-benz', label: 'Mercedes-Benz' },
                  { slug: 'skoda',         label: 'Škoda' },
                ] as const).map(({ slug, label }) => (
                  <Link
                    key={slug}
                    href={`/${currentLocale}/cars/${slug}`}
                    className="inline-flex shrink-0 touch-manipulation items-center rounded-full border border-(--color-border) bg-white px-4 py-2 text-xs font-bold text-(--color-text-2) shadow-sm transition hover:border-(--accent-border) hover:bg-(--accent-soft) hover:text-(--accent-dark)"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </Reveal>
            {featuredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
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

        {/* ── Kupovina sa više sigurnosti — rendered immediately after Aktuelna premium selekcija ── */}
        <section className="bg-white py-9 min-[390px]:py-10 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <SectionHeader title={copy.trustTitle} subtitle={copy.trustSub} />
            </Reveal>
            <div className="mt-5 grid gap-3 min-[390px]:mt-6 min-[390px]:gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
              {copy.trust.map(([title, text, Icon], index) => (
              <Reveal key={title} delay={index * 90} className="luxury-trust-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm min-[390px]:p-5 sm:rounded-3xl sm:p-6">
                <div className="trust-card-icon mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] min-[390px]:h-10 min-[390px]:w-10 sm:mb-6 sm:h-11 sm:w-11 sm:rounded-2xl">
                    <Icon size={21} />
                  </div>
                  <h3 className="text-base font-black text-[var(--color-text)] sm:text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] sm:mt-3 sm:leading-7">{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

      <section className="relative isolate overflow-hidden bg-[#11100E] py-11 text-white min-[390px]:py-12 sm:py-24">
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
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/76 backdrop-blur-md sm:mb-5 sm:px-3.5 sm:py-2 sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)]" />
                {copy.darkEyebrow}
              </div>
              <h2 className="max-w-2xl text-2xl font-black leading-tight !text-white drop-shadow-[0_4px_22px_rgba(0,0,0,0.34)] min-[390px]:text-3xl sm:text-5xl">
                {darkTitleParts[0]}
                <span className="text-[var(--accent)]">{copy.darkAccent}</span>
                {darkTitleParts[1]}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] min-[390px]:mt-4 sm:mt-6 sm:text-base sm:leading-8">{copy.darkSub}</p>
            </Reveal>

            <div className="hidden min-h-[18rem] rounded-[2rem] border border-white/0 lg:block" aria-hidden="true" />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3 lg:mt-10 lg:gap-4">
            {copy.darkCards.map(([title, text, Icon], index) => (
              <Reveal key={title} delay={180 + index * 120} className="group relative min-h-[10.75rem] overflow-hidden rounded-3xl border border-white/18 bg-[#12110F]/42 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.30)] backdrop-blur-xl transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:inset-0 before:bg-[linear-gradient(150deg,rgba(255,255,255,0.18),transparent_42%,rgba(201,168,76,0.12))] before:opacity-75 before:transition-opacity before:duration-1000 before:ease-[cubic-bezier(0.22,1,0.36,1)] min-[390px]:min-h-[11.5rem] sm:min-h-[14rem] sm:p-6 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-px motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:border-white/22 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#13110F]/45 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_25px_82px_rgba(0,0,0,0.32)] motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:before:opacity-82">
                <div className="relative flex h-full flex-col">
                  <div className="mb-5 flex items-start justify-between gap-4 sm:mb-8">
                    <span className="text-3xl font-black leading-none text-white/18 transition-colors duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-5xl motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-[var(--accent)]/32">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent)]/16 text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_28px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-14 sm:w-14 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:border-[var(--accent)]/35 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-[var(--accent)]/19 motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.17),0_11px_29px_rgba(0,0,0,0.23)]">
                      <Icon size={23} />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-base font-black leading-tight !text-white sm:text-lg">{title}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/72 sm:mt-3">{text}</p>
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

      <section className="bg-[#F7F7F9] py-9 min-[390px]:py-10 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:gap-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="divider-gold mb-5" />
            <h2 className="max-w-2xl text-2xl font-black leading-tight text-[var(--color-text)] min-[390px]:text-[1.7rem] sm:text-4xl">{copy.dealerTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-muted)] sm:mt-5 sm:text-base sm:leading-8">{copy.dealerSub}</p>
            <TrustBadges locale={currentLocale} badges={['dealer', 'transparent', 'inspection', 'swiss']} className="mt-4 sm:mt-6" />
          </Reveal>
          <div className="grid gap-3">
            {copy.dealerPillars.map(([title, text], index) => (
              <Reveal key={title} delay={index * 90} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition hover:border-[var(--accent-border)] hover:shadow-[0_16px_42px_rgba(15,15,20,0.08)] min-[390px]:p-5 sm:rounded-3xl">
                <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--accent-dark)] sm:mb-3 sm:text-xs">0{index + 1}</div>
                <h3 className="text-base font-black text-[var(--color-text)] sm:text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] sm:leading-7">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-9 min-[390px]:py-10 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeader title={copy.reviewsTitle} subtitle={copy.reviewsSub} centered />
          </Reveal>
          <div className="mt-5 grid gap-3 min-[390px]:mt-6 min-[390px]:gap-4 sm:mt-10 lg:grid-cols-3">
            {copy.reviews.map(([quote, name, source], index) => (
              <Reveal key={`${name}-${source}`} delay={index * 90} className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5 sm:rounded-3xl sm:p-6">
                <div className="mb-3 flex items-center gap-1 text-[var(--accent)] sm:mb-5">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                    <Star key={`star-${n}`} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-base leading-7 text-[var(--color-text)] sm:text-lg sm:leading-8">&ldquo;{quote}&rdquo;</p>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4 sm:mt-6 sm:pt-5">
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

      <section className="bg-[var(--color-bg)] py-9 min-[390px]:py-10 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-[0_24px_70px_rgba(15,15,20,0.1)] min-[390px]:p-5 sm:rounded-[34px] sm:p-10 lg:p-12">
            <Image
              src="/mojautodiler_front.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 72rem, 100vw"
              className="pointer-events-none object-cover object-center opacity-[0.18] blur-[1px]"
            />
            <div className="pointer-events-none absolute inset-0 bg-white/78 sm:bg-white/82" />
            <div className="pointer-events-none absolute inset-0 bg-[var(--color-bg)]/8" />
            <div className="relative grid gap-5 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--accent-dark)] sm:mb-5 sm:px-3.5 sm:text-xs">
                  <CalendarCheck size={15} />
                  {copy.ctaBadge}
                </div>
                <h2 className="max-w-2xl text-2xl font-black leading-tight text-[var(--color-text)] min-[390px]:text-3xl sm:text-5xl">{copy.ctaTitle}</h2>
                <p className="mt-3 max-w-xl whitespace-pre-line text-sm leading-6 text-[var(--color-text-muted)] sm:mt-5 sm:text-base sm:leading-8">{copy.ctaSub}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href={`/${currentLocale}/contact`} className="btn-gold inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl px-7 text-sm">
                  {copy.ctaPrimary}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
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
