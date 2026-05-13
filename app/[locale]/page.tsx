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
import VehicleCard from '@/components/vehicle/VehicleCard';
import { getDealerInfo, mockVehicles } from '@/data/vehicles';
import { getTranslations, isValidLocale, Locale } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';

const homeCopy = {
  sr: {
    eyebrow: 'Premium auto salon • Preševo',
    title: 'Premium vozila, proverena pre isporuke.',
    lead: 'Premium automobili sa transparentnom istorijom. Boutique pristup prodaji polovnih premium vozila u Preševu, uz jasnu proveru, realnu preporuku i mirnu kupovinu bez pritiska.',
    primary: 'Pregledaj vozila',
    secondary: 'Zakazi razgledanje',
    heroNote: 'Diskretna selekcija premium vozila u Preševu, sa dokumentovanom istorijom i pregledom pre prodaje.',
    featuredLabel: 'Izdvojeno vozilo',
    verifiedLine: 'Provereno poreklo, servis i stanje',
    stats: [
      ['100+', 'vozila prodato u poslednje 2 godine'],
      ['5.0', 'ocena kupaca na PolovniAutomobili'],
      ['98%', 'zadovoljnih kupaca nakon isporuke'],
      ['24h', 'brz odgovor za pregled vozila'],
    ],
    trustTitle: 'Kupovina sa vise sigurnosti',
    trustSub: 'Svaki detalj je postavljen da kupac dobije jasnu sliku pre odluke.',
    trust: [
      ['Pouzdan salon u Preševu', 'Lokalna reputacija za jug Srbije, potvrdjena kroz kupce i javne recenzije.', ShieldCheck],
      ['Transparentna istorija', 'Poreklo, servis i stanje komuniciramo bez skrivenih stavki.', ClipboardCheck],
      ['Profesionalna provera', 'Vozila se pregledaju pre prodaje i pre preporuke kupcu.', Wrench],
      ['Podrska do isporuke', 'Razgledanje, probna voznja, dokumentacija i finansiranje.', KeyRound],
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
    ctaPrimary: 'Kontaktirajte salon',
    ctaCall: 'Pozovi direktno',
  },
  sq: {
    eyebrow: 'Autosallon premium • Preševo',
    title: 'Automjete premium, te verifikuara.',
    lead: 'Automjete premium me histori transparente. Qasje boutique per shitjen e automjeteve premium ne Preševo, me kontroll te qarte, rekomandim real dhe blerje pa presion.',
    primary: 'Shiko automjetet',
    secondary: 'Rezervo shikim',
    heroNote: 'Seleksion diskret automjetesh premium ne Preševo, me histori te dokumentuar dhe kontroll para shitjes.',
    featuredLabel: 'Automjet i zgjedhur',
    verifiedLine: 'Origjine, servis dhe gjendje e verifikuar',
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
      ['Mbeshtetje deri ne dorezim', 'Shikim, test vozitje, dokumentacion dhe financim.', KeyRound],
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const currentLocale = locale as Locale;
  const t = getTranslations(currentLocale);
  const copy = homeCopy[currentLocale];
  const dealer = getDealerInfo();
  const featuredVehicles = mockVehicles.filter((vehicle) => vehicle.featured && vehicle.status === 'active').slice(0, 4);
  const heroVehicle = featuredVehicles[0] || mockVehicles.find((vehicle) => vehicle.status === 'active') || mockVehicles[0];

  return (
    <>
      <DealerJsonLd dealer={dealer} />

      <section className="relative overflow-hidden bg-[var(--color-bg)] pt-24 sm:pt-28 lg:pt-32">
        <Image
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none -z-10 object-cover opacity-[0.035] blur-sm"
        />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16 lg:pb-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-dark)]">
              <Car size={14} />
              {copy.eyebrow}
            </div>

            <h1 className="max-w-[720px] text-balance text-[2.65rem] font-black leading-[1.06] text-[var(--color-text)] sm:text-5xl lg:text-[3.45rem] xl:text-[4.15rem]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
              {copy.lead}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${currentLocale}/inventory`} className="btn-gold inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-7 text-sm">
                {copy.primary}
                <ArrowRight size={17} />
              </Link>
              <Link href={`/${currentLocale}/contact`} className="btn-outline inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-7 text-sm">
                {copy.secondary}
                <ChevronRight size={17} />
              </Link>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {copy.stats.map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4 shadow-sm">
                  <div className="text-2xl font-black text-[var(--color-text)]">{value}</div>
                  <p className="mt-2 text-[11px] leading-4 text-[var(--color-text-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative pb-12 lg:pb-0">
            <div className="relative overflow-hidden rounded-[34px] bg-[var(--color-surface-2)] shadow-[0_28px_70px_rgba(15,15,20,0.15)]">
              <div className="relative aspect-[4/3] min-h-[360px] sm:min-h-[470px]">
                <Image
                  src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1400&q=86"
                  alt="Luxury dealership vehicle"
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="absolute bottom-0 left-4 right-4 rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_48px_rgba(15,15,20,0.12)] sm:left-8 sm:right-auto sm:w-[370px]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{copy.featuredLabel}</p>
                  <h2 className="mt-1 truncate text-lg font-black text-[var(--color-text)]">{heroVehicle.title}</h2>
                </div>
                <p className="shrink-0 text-right text-lg font-black text-[var(--accent-dark)]">
                  {formatPrice(heroVehicle.price, heroVehicle.currency)}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-muted)]">
                <ShieldCheck size={16} className="text-[var(--accent)]" />
                {copy.verifiedLine}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader title={copy.trustTitle} subtitle={copy.trustSub} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.trust.map(([title, text, Icon]) => (
              <article key={title} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,15,20,0.08)]">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={21} />
                </div>
                <h3 className="text-lg font-black text-[var(--color-text)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader title={copy.featuredTitle} subtitle={copy.featuredSub} />
            <Link href={`/${currentLocale}/inventory`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-dark)] transition hover:text-[var(--accent)]">
              {copy.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} locale={currentLocale} t={t} />
            ))}
          </div>
        </div>
      </section>

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
          <div>
            <div className="divider-gold mb-5" />
            <h2 className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl">{copy.darkTitle}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/72">{copy.darkSub}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {copy.darkPoints.map((point, index) => (
              <div key={point} className="rounded-3xl border border-white/15 bg-white/[0.09] p-5 backdrop-blur-sm">
                <div className="mb-5 text-sm font-black text-white/45">0{index + 1}</div>
                <CheckCircle2 size={20} className="mb-3 text-[var(--accent)]" />
                <p className="text-sm font-bold leading-6 text-white">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader title={copy.reviewsTitle} subtitle={copy.reviewsSub} centered />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {copy.reviews.map(([quote, name, source]) => (
              <article key={`${name}-${source}`} className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-1 text-[var(--accent)]">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg)] px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-white p-7 shadow-[0_24px_70px_rgba(15,15,20,0.1)] sm:p-10 lg:p-12">
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
        </div>
      </section>
    </>
  );
}

function SectionHeader({ title, subtitle, centered = false }: { title: string; subtitle: string; centered?: boolean }) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <div className={centered ? 'divider-gold mx-auto mb-4' : 'divider-gold mb-4'} />
      <h2 className="text-3xl font-black leading-tight text-[var(--color-text)] sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">{subtitle}</p>
    </div>
  );
}
