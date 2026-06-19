import type { Vehicle } from '@/types/vehicle';
import { getTranslations } from '@/lib/i18n';

// ── Public types ─────────────────────────────────────────────────────────────

export interface VehicleSeoOutput {
  seoTitle:        string;
  metaDescription: string;
  seoDescription:  string;
  benefits:        string[];
  buyerProfile:    string[];
  faq:             Array<{ q: string; a: string }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type Locale = 'sr' | 'sq';

function fmtKm(km: number): string {
  return km.toLocaleString('sr-RS');
}

function hasEquip(eq: string[], ...keywords: string[]): boolean {
  const joined = eq.join(' ').toLowerCase();
  return keywords.some((k) => joined.includes(k.toLowerCase()));
}

function priceTier(price: number): 'budget' | 'mid' | 'premium' | 'luxury' {
  if (price < 10_000) return 'budget';
  if (price < 25_000) return 'mid';
  if (price < 50_000) return 'premium';
  return 'luxury';
}

// ── Title ────────────────────────────────────────────────────────────────────

function buildKeySignal(v: Vehicle, locale: Locale): string {
  if (v.origin?.trim()) {
    return locale === 'sq'
      ? `Import nga ${v.origin.trim()}`
      : `Uvoz ${v.origin.trim()}`;
  }
  if (hasEquip(v.equipment, 'servisna', 'service')) {
    return locale === 'sq' ? 'Histori servisi' : 'Servisna istorija';
  }
  if (v.mileage < 80_000) {
    return locale === 'sq' ? 'Kilometrazh i ulët' : 'Niska kilometraža';
  }
  if (v.drivetrain === '4x4' || v.drivetrain === 'awd') {
    const t = getTranslations(locale);
    return t.drivetrain[v.drivetrain];
  }
  if (v.transmission === 'automatski') {
    return locale === 'sq' ? 'Automatik' : 'Automatski menjač';
  }
  return locale === 'sq' ? 'Automjet i përdorur' : 'Polovni automobili';
}

function buildTitle(v: Vehicle, locale: Locale): string {
  const gen = v.generation ? ` ${v.generation}` : '';
  const signal = buildKeySignal(v, locale);
  const core = `${v.brand} ${v.model}${gen} ${v.year}`;
  const full = `${core} | ${signal} | MojAutoDiler`;
  if (full.length <= 65) return full;
  const short = `${v.brand} ${v.model} ${v.year} | ${signal} | MojAutoDiler`;
  if (short.length <= 65) return short;
  return `${v.brand} ${v.model} ${v.year} | MojAutoDiler`;
}

// ── Meta description ─────────────────────────────────────────────────────────

function buildMetaDesc(v: Vehicle, locale: Locale): string {
  const t = getTranslations(locale);
  const km = fmtKm(v.mileage);
  const fuel = t.fuel[v.fuelType] ?? v.fuelType;
  const trans = t.transmission[v.transmission] ?? v.transmission;
  const origin = v.origin?.trim();
  const hp = v.horsepower ? `, ${v.horsepower} KS` : '';

  if (locale === 'sq') {
    const base = `${v.brand} ${v.model} ${v.year}, ${km} km, ${fuel}, ${trans}${hp}.`;
    const org = origin ? ` Import nga ${origin}.` : '';
    return `${base}${org} Shikoni ofertën në MojAutoDiler.`.slice(0, 160);
  }

  const base = `${v.brand} ${v.model} ${v.year}. godište, ${km} km, ${fuel}, ${trans}${hp}.`;
  const org = origin ? ` Uvoz ${origin}.` : '';
  return `${base}${org} Pogledajte ponudu na MojAutoDiler.`.slice(0, 160);
}

// ── SEO description (150–300 words) ──────────────────────────────────────────

const BODY_DESC_SR: Record<string, string> = {
  suv:       'prostran SUV sa visokom pozicijom sedenja i praktičnim enterijerm za porodicu i putovanja',
  hatchback: 'kompaktni hatchback idealan za gradsku vožnju i svakodnevne potrebe',
  limuzina:  'elegantna limuzina sa prostranim enterijerm i komfornom vožnjom na dugim relacijama',
  karavan:   'prostran karavan sa velikim prtljažnikom, idealan za porodice i aktivne vozače',
  kupe:      'sportski kupe sa dinamičnim karakterom i atraktivnim dizajnom',
  kabriolet: 'kabriolet za vozače koji cene otvorenu vožnju i sportski stil',
  van:       'prostran van sa maksimalnim unutrašnjim prostorom za porodice i poslovanje',
  pickup:    'robustan pickup za terenske uslove i zahtevne radne zadatke',
};

const BODY_DESC_SQ: Record<string, string> = {
  suv:       'SUV i bollshëm me pozicion të lartë ndenjjeje dhe interior praktik për familje dhe udhëtime',
  hatchback: 'hatchback kompakt, ideal për ngasje urbane dhe nevojat e përditshme',
  limuzina:  'limuzinë elegante me interior të bollshëm dhe rehati në distanca të gjata',
  karavan:   'karavan i bollshëm me bagazh të madh, ideal për familje dhe shoferë aktivë',
  kupe:      'kupé sportive me karakter dinamik dhe dizajn tërheqës',
  kabriolet: 'kabriolet për shoferë që vlerësojnë ngasjen e hapur dhe stilin sportiv',
  van:       'van i bollshëm me hapësirë maksimale të brendshme për familje dhe biznes',
  pickup:    'pickup i qëndrueshëm për kushte terrenore dhe detyra pune kërkuese',
};

function buildSeoDescription(v: Vehicle, locale: Locale): string {
  const t = getTranslations(locale);
  const km = fmtKm(v.mileage);
  const fuel = t.fuel[v.fuelType] ?? v.fuelType;
  const trans = t.transmission[v.transmission] ?? v.transmission;
  const body = (locale === 'sq' ? BODY_DESC_SQ : BODY_DESC_SR)[v.bodyType] ?? '';
  const origin = v.origin?.trim();
  const hp = v.horsepower ? `${v.horsepower} KS` : '';
  const gen = v.generation ? ` ${v.generation}` : '';
  const hasService = hasEquip(v.equipment, 'servisna', 'service');
  const has4wd = v.drivetrain === '4x4' || v.drivetrain === 'awd';
  const driveLabel = has4wd ? (t.drivetrain[v.drivetrain] ?? v.drivetrain) : '';

  if (locale === 'sq') {
    const p1 = `${v.brand} ${v.model}${gen} është ${body}. Ky ekzemplar nga viti ${v.year} ka ${km} km, motor ${fuel}${hp ? ` me ${hp}` : ''} dhe transmision ${trans.toLowerCase()}.`;
    const p2Parts: string[] = [];
    if (origin) p2Parts.push(`importuar nga ${origin} me origjinë të verifikuar`);
    if (hasService) p2Parts.push('histori e dokumentuar servisi');
    if (has4wd) p2Parts.push(`tërheqje ${driveLabel} për kushte dimri dhe terren`);
    const p2 = p2Parts.length > 0
      ? ` Automjeti vjen ${p2Parts.join(', ')}.`
      : '';
    const p3 = ` Në MojAutoDiler çdo automjet kalon selekcion para prezantimit. Ofrojmë blerje transparente pa presion, me dokumentacion të plotë dhe mbështetje profesionale.`;
    return `${p1}${p2}${p3}`;
  }

  const p1 = `${v.brand} ${v.model}${gen} je ${body}. Ovaj primerak iz ${v.year}. godišta ima ${km} km, ${fuel.toLowerCase()} motor${hp ? ` snage ${hp}` : ''} i ${trans.toLowerCase()} menjač.`;
  const p2Parts: string[] = [];
  if (origin) p2Parts.push(`uvezen iz ${origin} sa proverenim poreklom`);
  if (hasService) p2Parts.push('dokumentovana servisna istorija');
  if (has4wd) p2Parts.push(`${driveLabel} pogon za sve vremenske uslove`);
  const p2 = p2Parts.length > 0
    ? ` Vozilo dolazi ${p2Parts.join(', ')}.`
    : '';
  const p3 = ` Na MojAutoDiler platformi svako vozilo prolazi selekciju pre objave. Nudimo transparentnu kupovinu bez pritiska, sa kompletnom dokumentacijom i stručnom podrškom.`;
  return `${p1}${p2}${p3}`;
}

// ── Benefits (5–8 bullets) ───────────────────────────────────────────────────

interface BenefitCandidate {
  condition: boolean;
  sr: string;
  sq: string;
}

function buildBenefits(v: Vehicle, locale: Locale): string[] {
  const t = getTranslations(locale);
  const fuel = t.fuel[v.fuelType] ?? v.fuelType;
  const trans = t.transmission[v.transmission] ?? v.transmission;
  const origin = v.origin?.trim();

  const candidates: BenefitCandidate[] = [
    {
      condition: v.fuelType === 'dizel',
      sr: `Ekonomičan dizel motor — niska potrošnja goriva na dugim relacijama`,
      sq: `Motor diesel ekonomik — konsum i ulët i karburantit në distanca të gjata`,
    },
    {
      condition: v.fuelType === 'benzin',
      sr: `Benzinski motor — tiši rad i niži troškovi servisa`,
      sq: `Motor benzin — punë më e qetë dhe kosto më e ulët servisi`,
    },
    {
      condition: v.fuelType === 'hibrid',
      sr: `Hibridni pogon — kombinacija efikasnosti i snage`,
      sq: `Tërheqje hibride — kombinim i efikasitetit dhe fuqisë`,
    },
    {
      condition: v.fuelType === 'elektricni',
      sr: `Električni pogon — nulta emisija i niski troškovi energije`,
      sq: `Tërheqje elektrike — emetime zero dhe kosto e ulët energjie`,
    },
    {
      condition: !!origin,
      sr: `Uvoz iz ${origin} — proverena dokumentacija i poreklo vozila`,
      sq: `Import nga ${origin} — dokumentacion i verifikuar dhe origjinë e automjetit`,
    },
    {
      condition: v.mileage < 80_000,
      sr: `Niska kilometraža (${fmtKm(v.mileage)} km) — pažljivo čuvano vozilo`,
      sq: `Kilometrazh i ulët (${fmtKm(v.mileage)} km) — automjet i ruajtur me kujdes`,
    },
    {
      condition: v.mileage >= 80_000 && v.mileage < 160_000,
      sr: `Redovna kilometraža (${fmtKm(v.mileage)} km) za godište — očekivani servisni intervali`,
      sq: `Kilometrazh i rregullt (${fmtKm(v.mileage)} km) për vitin — intervale servisi të pritura`,
    },
    {
      condition: v.transmission === 'automatski',
      sr: `${trans} menjač — udobna vožnja bez prebacivanja`,
      sq: `Transmision ${trans.toLowerCase()} — ngasje e rehatshme pa ndërrim manual`,
    },
    {
      condition: v.drivetrain === '4x4' || v.drivetrain === 'awd',
      sr: `${t.drivetrain[v.drivetrain]} pogon — sigurnost u svim uslovima`,
      sq: `Tërheqje ${t.drivetrain[v.drivetrain]} — siguri në të gjitha kushtet`,
    },
    {
      condition: !!v.horsepower && v.horsepower >= 150,
      sr: `Snažan motor sa ${v.horsepower} KS — dinamične performanse`,
      sq: `Motor i fuqishëm me ${v.horsepower} KS — performancë dinamike`,
    },
    {
      condition: hasEquip(v.equipment, 'navigac', 'navi'),
      sr: `Fabrička navigacija — udobna vožnja bez dodatnih uređaja`,
      sq: `Navigacion fabrik — ngasje e rehatshme pa pajisje shtesë`,
    },
    {
      condition: hasEquip(v.equipment, 'kožna', 'koža', 'leather'),
      sr: `Kožna sedišta — premium komfor i enterijer`,
      sq: `Ndenjëse lëkure — rehati dhe interior premium`,
    },
    {
      condition: hasEquip(v.equipment, 'panoram'),
      sr: `Panoramski krov — više svetla i osećaj prostora`,
      sq: `Çati panoramike — më shumë dritë dhe ndjenjë hapësire`,
    },
    {
      condition: hasEquip(v.equipment, 'kamera', 'camera', 'parking'),
      sr: `Parking kamera — lakše i sigurnije parkiranje`,
      sq: `Kamerë parkimi — parkim më i lehtë dhe më i sigurt`,
    },
    {
      condition: hasEquip(v.equipment, 'servisna', 'service'),
      sr: `Dokumentovana servisna istorija — transparentan pregled održavanja`,
      sq: `Histori e dokumentuar servisi — pasqyrë transparente e mirëmbajtjes`,
    },
    {
      condition: v.bodyType === 'suv',
      sr: `SUV karoserija — visoka pozicija sedenja i prostran enterijer`,
      sq: `Karroceri SUV — pozicion i lartë ndenjjeje dhe interior i bollshëm`,
    },
    {
      condition: v.bodyType === 'karavan',
      sr: `Karavan karoserija — veliki prtljažnik za porodicu i putovanja`,
      sq: `Karroceri karavan — bagazh i madh për familje dhe udhëtime`,
    },
    {
      condition: true,
      sr: `${v.brand} kvalitet — pouzdanost i dobra preprodajna vrednost`,
      sq: `Cilësi ${v.brand} — besueshmëri dhe vlerë e mirë rishitjeje`,
    },
  ];

  return candidates
    .filter((c) => c.condition)
    .slice(0, 8)
    .map((c) => locale === 'sq' ? c.sq : c.sr);
}

// ── Buyer profile (3–5 bullets) ──────────────────────────────────────────────

function buildBuyerProfile(v: Vehicle, locale: Locale): string[] {
  const tier = priceTier(v.price);
  const items: Array<{ sr: string; sq: string }> = [];

  if (v.bodyType === 'suv') {
    items.push({
      sr: 'Porodice koje cene prostor, sigurnost i visoku poziciju sedenja',
      sq: 'Familje që vlerësojnë hapësirën, sigurinë dhe pozicionin e lartë të ndenjjes',
    });
    items.push({
      sr: 'Aktivni vozači koji putuju u planinu ili na terenske destinacije',
      sq: 'Shoferë aktivë që udhëtojnë në mal ose destinacione terrenore',
    });
  } else if (v.bodyType === 'hatchback') {
    items.push({
      sr: 'Mladi profesionalci i studenti koji traže ekonomičan gradski auto',
      sq: 'Profesionistë të rinj dhe studentë që kërkojnë automjet ekonomik urban',
    });
    items.push({
      sr: 'Vozači koji kombinuju gradsku i međugradsku vožnju',
      sq: 'Shoferë që kombinojnë ngasjen urbane me atë interurbane',
    });
  } else if (v.bodyType === 'limuzina') {
    items.push({
      sr: 'Poslovni korisnici i profesionalci kojima treba reprezentativan automobil',
      sq: 'Përdorues biznesi dhe profesionistë që kanë nevojë për automjet përfaqësues',
    });
    items.push({
      sr: 'Vozači koji preferiraju udobnost i eleganciju na dužim relacijama',
      sq: 'Shoferë që preferojnë rehatinë dhe elegancën në distanca të gjata',
    });
  } else if (v.bodyType === 'karavan') {
    items.push({
      sr: 'Porodice kojima treba maksimalan prostor za prtljag i opremu',
      sq: 'Familje që kanë nevojë për hapësirë maksimale për bagazh dhe pajisje',
    });
    items.push({
      sr: 'Vozači koji redovno putuju i cene praktičnost karavana',
      sq: 'Shoferë që udhëtojnë rregullisht dhe vlerësojnë praktikitetin e karavanit',
    });
  } else {
    items.push({
      sr: 'Vozači koji traže pouzdan automobil za svakodnevnu upotrebu',
      sq: 'Shoferë që kërkojnë automjet të besueshëm për përdorim të përditshëm',
    });
  }

  if (v.fuelType === 'dizel') {
    items.push({
      sr: 'Kupci koji voze duge relacije i cene nisku potrošnju goriva',
      sq: 'Blerës që ngasin distanca të gjata dhe vlerësojnë konsum të ulët karburanti',
    });
  }

  if (tier === 'budget') {
    items.push({
      sr: 'Kupci sa ograničenim budžetom koji ne žele kompromis u pouzdanosti',
      sq: 'Blerës me buxhet të kufizuar që nuk duan kompromis në besueshmëri',
    });
  } else if (tier === 'premium' || tier === 'luxury') {
    items.push({
      sr: 'Kupci koji cene premium kvalitet materijala i opreme',
      sq: 'Blerës që vlerësojnë cilësinë premium të materialeve dhe pajisjeve',
    });
  }

  if (v.drivetrain === '4x4' || v.drivetrain === 'awd') {
    items.push({
      sr: 'Vozači u regionima sa oštrijom zimom i zahtevnijim putevima',
      sq: 'Shoferë në rajone me dimër të ashpër dhe rrugë më kërkuese',
    });
  }

  return items.slice(0, 5).map((i) => locale === 'sq' ? i.sq : i.sr);
}

// ── FAQ (4–6 pairs) ──────────────────────────────────────────────────────────

interface FaqCandidate {
  condition: boolean;
  sr: { q: string; a: string };
  sq: { q: string; a: string };
}

function buildFaq(v: Vehicle, locale: Locale): Array<{ q: string; a: string }> {
  const t = getTranslations(locale);
  const fuel = t.fuel[v.fuelType] ?? v.fuelType;
  const gen = v.generation ? ` ${v.generation}` : '';
  const origin = v.origin?.trim();

  const candidates: FaqCandidate[] = [
    {
      condition: true,
      sr: {
        q: `Da li je ${v.brand} ${v.model}${gen} pouzdan automobil?`,
        a: `${v.brand} ${v.model}${gen} se generalno smatra pouzdanim vozilom uz redovan servis prema propisanim intervalima. Preporučujemo proveru kompletne servisne istorije i profesionalni pregled pre kupovine.`,
      },
      sq: {
        q: `A është ${v.brand} ${v.model}${gen} automjet i besueshëm?`,
        a: `${v.brand} ${v.model}${gen} konsiderohet përgjithësisht automjet i besueshëm me servisim të rregullt sipas intervaleve të përcaktuara. Rekomandojmë kontrollin e historisë së plotë të servisit dhe inspektimin profesional para blerjes.`,
      },
    },
    {
      condition: v.fuelType === 'dizel',
      sr: {
        q: `Kolika je potrošnja goriva ${v.brand} ${v.model}${gen} sa dizel motorom?`,
        a: `${v.brand} ${v.model}${gen} sa ${fuel.toLowerCase()} motorom troši prosečno 5–7 litara na 100 km na mešovitim relacijama, u zavisnosti od zapremine motora i stila vožnje. Na autoputu potrošnja može biti i niža.`,
      },
      sq: {
        q: `Sa është konsumi i karburantit i ${v.brand} ${v.model}${gen} me motor diesel?`,
        a: `${v.brand} ${v.model}${gen} me motor ${fuel.toLowerCase()} konsumon mesatarisht 5–7 litra për 100 km në rrugë të përziera, në varësi të vëllimit të motorit dhe stilit të ngasjes. Në autostradë konsumi mund të jetë edhe më i ulët.`,
      },
    },
    {
      condition: v.fuelType === 'benzin',
      sr: {
        q: `Da li je benzinski motor na ${v.brand} ${v.model}${gen} ekonomičan?`,
        a: `Benzinski motori na ${v.brand} ${v.model}${gen} su generalno tiši i jeftiniji za servis od dizelaša. Prosečna potrošnja je 6.5–9 litara na 100 km u zavisnosti od zapremine i stila vožnje.`,
      },
      sq: {
        q: `A është motori benzin i ${v.brand} ${v.model}${gen} ekonomik?`,
        a: `Motorët benzin të ${v.brand} ${v.model}${gen} janë përgjithësisht më të qetë dhe më të lirë për servisim sesa ata diesel. Konsumi mesatar është 6.5–9 litra për 100 km në varësi të vëllimit dhe stilit të ngasjes.`,
      },
    },
    {
      condition: !!origin,
      sr: {
        q: `Šta znači uvoz iz ${origin}?`,
        a: `Vozila uvezena iz ${origin} često imaju urednu servisnu dokumentaciju i dokumentovanu istoriju vlasnika. ${origin} važi za pouzdano tržište sa visokim standardima održavanja, što znači manji rizik skrivenih problema.`,
      },
      sq: {
        q: `Çfarë do të thotë import nga ${origin}?`,
        a: `Automjetet e importuara nga ${origin} shpesh kanë dokumentacion të rregullt servisi dhe histori të dokumentuar pronësie. ${origin} konsiderohet treg i besueshëm me standarde të larta mirëmbajtjeje, që nënkupton rrezik më të vogël të problemeve të fshehura.`,
      },
    },
    {
      condition: v.bodyType === 'suv',
      sr: {
        q: `Da li je ${v.brand} ${v.model}${gen} pogodan za porodičnu upotrebu?`,
        a: `${v.brand} ${v.model}${gen} kao SUV nudi prostran enterijer za 5 putnika, visoku poziciju sedenja i dobru preglednost. Prostran prtljažnik i povišeni komfor čine ga odličnim izborom za porodice.`,
      },
      sq: {
        q: `A është ${v.brand} ${v.model}${gen} i përshtatshëm për përdorim familjar?`,
        a: `${v.brand} ${v.model}${gen} si SUV ofron interior të bollshëm për 5 pasagjerë, pozicion të lartë ndenjjeje dhe dukshmëri të mirë. Bagazhi i bollshëm dhe rehatia e lartë e bëjnë zgjedhje të shkëlqyer për familjet.`,
      },
    },
    {
      condition: v.transmission === 'automatski',
      sr: {
        q: `Koje su prednosti automatskog menjača na ovom vozilu?`,
        a: `Automatski menjač na ${v.brand} ${v.model}${gen} obezbeđuje glatko prebacivanje bez prekida snage, komforniju vožnju u gradskim uslovima i manje zamora na dugim putovanjima. Moderni automatski menjači su pouzdani uz redovnu zamenu ulja.`,
      },
      sq: {
        q: `Cilat janë avantazhet e transmisionit automatik në këtë automjet?`,
        a: `Transmisioni automatik i ${v.brand} ${v.model}${gen} siguron ndërrim pa ndërprerje të fuqisë, ngasje më të rehatshme në kushte urbane dhe më pak lodhje në udhëtime të gjata. Transmisionet automatike moderne janë të besueshme me ndërrim të rregullt të vajit.`,
      },
    },
    {
      condition: v.drivetrain === '4x4' || v.drivetrain === 'awd',
      sr: {
        q: `Da li je pogon na sva četiri točka neophodan na ovom vozilu?`,
        a: `Pogon na sva četiri točka na ${v.brand} ${v.model}${gen} pruža bolju trakciju na mokrim, snežnim i terenskim putevima. Preporučujemo ga za vozače u planinskim regionima ili u oblastima sa hladnijim zimama.`,
      },
      sq: {
        q: `A është tërheqja me katër rrota e nevojshme në këtë automjet?`,
        a: `Tërheqja me katër rrota e ${v.brand} ${v.model}${gen} ofron trakcion më të mirë në rrugë të lagura, me dëborë dhe terren. E rekomandojmë për shoferë në rajone malore ose zona me dimra më të ftohta.`,
      },
    },
    {
      condition: true,
      sr: {
        q: `Da li ${v.brand} ${v.model}${gen} drži vrednost pri preprodaji?`,
        a: `${v.brand} modeli su generalno traženi na tržištu polovnih automobila u Srbiji. ${v.model}${gen} posebno zadržava dobru vrednost zahvaljujući pouzdanosti i poznatom brendu. Stanje vozila, kilometraža i servisna istorija najviše utiču na cenu.`,
      },
      sq: {
        q: `A e ruan ${v.brand} ${v.model}${gen} vlerën në rishitje?`,
        a: `Modelet ${v.brand} janë përgjithësisht të kërkuara në tregun e automjeteve të përdorura në Serbi. ${v.model}${gen} ruan vlerë të mirë falë besueshmërisë dhe brendit të njohur. Gjendja, kilometrazha dhe historia e servisit ndikojnë më shumë në çmim.`,
      },
    },
    {
      condition: true,
      sr: {
        q: `Kako kupiti ovo vozilo na MojAutoDiler?`,
        a: `Kontaktirajte nas putem telefona, Viber-a ili kontakt forme na stranici vozila. Naš tim će odgovoriti na sva pitanja, zakazati gledanje i pomoći oko kompletnog procesa kupovine — bez pritiska i skrivenih troškova.`,
      },
      sq: {
        q: `Si ta blej këtë automjet në MojAutoDiler?`,
        a: `Na kontaktoni përmes telefonit, Viber-it ose formës së kontaktit në faqen e automjetit. Ekipi ynë do t'ju përgjigjet për çdo pyetje, do të caktojë shikimin dhe do t'ju ndihmojë me procesin e plotë të blerjes — pa presion dhe pa kosto të fshehura.`,
      },
    },
  ];

  return candidates
    .filter((c) => c.condition)
    .slice(0, 6)
    .map((c) => locale === 'sq' ? c.sq : c.sr);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function generateVehicleSeo(vehicle: Vehicle, locale: Locale): VehicleSeoOutput {
  return {
    seoTitle:        buildTitle(vehicle, locale),
    metaDescription: buildMetaDesc(vehicle, locale),
    seoDescription:  buildSeoDescription(vehicle, locale),
    benefits:        buildBenefits(vehicle, locale),
    buyerProfile:    buildBuyerProfile(vehicle, locale),
    faq:             buildFaq(vehicle, locale),
  };
}
