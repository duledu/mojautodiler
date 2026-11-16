/**
 * Official Serbian legal responsibility & disclaimer copy for MojAutoDiler.com.
 *
 * Defines clear responsibility boundaries between the MojAutoDiler platform,
 * partner dealerships (advertisers), buyers, and independent third-party
 * services (such as carVertical), while preserving mandatory statutory rights.
 */

export const LEGAL_RESPONSIBILITY_PATH = '/sr/podela-odgovornosti/';
export const LEGAL_RESPONSIBILITY_CANONICAL_PATH = '/sr/podela-odgovornosti';

/**
 * Explicit pending-publication placeholder.
 * Must be replaced with the actual publication date immediately prior to production launch.
 */
export const LEGAL_LAST_UPDATED_PLACEHOLDER =
  '[Čeka produkcijsko objavljivanje — uneti tačan datum objave pre puštanja u rad]';

export const FOOTER_PLATFORM_DESCRIPTION = {
  title: 'O platformi MojAutoDiler',
  paragraphs: [
    'MojAutoDiler.com je besplatna informativno-oglasna platforma koja trenutno ne ostvaruje prihod, a čiji je cilj da kupcima polovnih automobila olakša pronalaženje, pregled i izbor vozila.',
    'Na jednom mestu predstavljamo pažljivo odabranu ponudu partnerskih auto-placeva, sa željom da proces kupovine polovnog automobila učinimo jednostavnijim, preglednijim i sigurnijim kroz bolju informisanost kupaca.',
    'MojAutoDiler nije prodavac oglašenih vozila, ne učestvuje u zaključivanju kupoprodajnih ugovora i ne garantuje njihovu tehničku ispravnost, kvalitet, poreklo niti pravni status. Za tačnost podataka o vozilu i uslove prodaje odgovoran je oglašivač, u skladu sa važećim zakonom.',
  ],
  linkLabel: 'Podela odgovornosti',
  linkHref: LEGAL_RESPONSIBILITY_PATH,
} as const;

export const VEHICLE_DETAIL_DISCLAIMER = {
  heading: 'Važne informacije o oglasu',
  paragraphs: [
    'Vozilo prikazano u ovom oglasu deo je ponude partnerskog auto-placa. MojAutoDiler.com služi za predstavljanje vozila i povezivanje zainteresovanih kupaca sa prodavcima i ne učestvuje u samoj kupoprodaji.',
    'Informacije o vozilu potiču od oglašivača i drugih dostupnih izvora. MojAutoDiler ne garantuje njihovu potpunost i tačnost, niti tehničku ispravnost, kilometražu, istoriju ili pravni status vozila.',
    'Pre kupovine preporučujemo nezavisnu proveru vozila, dokumentacije i uslova prodaje.',
  ],
  linkLabel: 'Detaljnije o odgovornosti platforme',
  linkHref: LEGAL_RESPONSIBILITY_PATH,
} as const;

export interface LegalSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphsBeforeBullets?: readonly string[];
  readonly bullets?: readonly string[];
  readonly paragraphsAfterBullets?: readonly string[];
  readonly paragraphs?: readonly string[];
  readonly showContactLink?: boolean;
}

export const LEGAL_RESPONSIBILITY_PAGE = {
  h1: 'Podela odgovornosti i odricanje od odgovornosti',
  seoTitle: 'Podela odgovornosti i odricanje od odgovornosti | Moj Auto Diler',
  seoDescription:
    'Informacije o prirodi platforme MojAutoDiler.com, podeli odgovornosti između platforme, oglašivača, kupaca i nezavisnih partnerskih servisa, kao i pravima korisnika.',
  lastUpdatedLabel: 'Poslednje ažuriranje:',
  lastUpdatedValue: LEGAL_LAST_UPDATED_PLACEHOLDER,
  sections: [
    {
      id: 'svrha-i-priroda-platforme',
      heading: '1. Svrha i priroda platforme',
      paragraphs: [
        'MojAutoDiler.com je besplatna informativno-oglasna platforma koja trenutno ne ostvaruje prihod i namenjena je predstavljanju ponude polovnih automobila i pružanju informacija koje kupcima mogu pomoći pri izboru vozila.',
        'Cilj platforme je da zainteresovanim kupcima omogući jednostavniji, pregledniji i informisaniji pristup ponudi polovnih automobila na jednom mestu.',
        'MojAutoDiler nije prodavac oglašenih vozila i ne učestvuje u zaključivanju kupoprodajnih ugovora između kupaca i prodavaca.',
      ],
    },
    {
      id: 'poreklo-i-izbor-oglasenih-vozila',
      heading: '2. Poreklo i izbor oglašenih vozila',
      paragraphs: [
        'Vozila prikazana na platformi dolaze iz ponude odabranih partnerskih auto-placeva.',
        'MojAutoDiler bira i predstavlja vozila prema sopstvenim kriterijumima kako bi posetiocima olakšao pregled ponude.',
        'Odabir i objavljivanje vozila ne predstavljaju potvrdu njegove tehničke ispravnosti, bezbednosti, kvaliteta, porekla, kilometraže, istorije održavanja ili pravnog statusa.',
        'Izrazi poput „odabrano vozilo“ i „premium selekcija“ predstavljaju oznake načina organizacije i predstavljanja ponude, a ne sertifikat ili garanciju kvaliteta.',
      ],
    },
    {
      id: 'odgovornost-za-informacije-u-oglasima',
      heading: '3. Odgovornost za informacije u oglasima',
      paragraphs: [
        'Informacije o vozilima, uključujući cenu, kilometražu, godište, opremu, tehničke karakteristike, fotografije, stanje i dostupnost, dostavljaju oglašivači ili se pribavljaju iz drugih dozvoljenih izvora.',
        'Oglašivači su odgovorni za tačnost, potpunost, ažurnost i zakonitost informacija koje dostavljaju, u skladu sa važećim propisima.',
        'MojAutoDiler nastoji da informacije budu korisne i pregledne, ali ne pruža nezavisnu garanciju njihove potpune tačnosti ili ažurnosti.',
        'Platforma može ispraviti, privremeno ukloniti ili trajno ukloniti oglase kada postoje opravdani razlozi, uključujući prijave netačnih ili obmanjujućih informacija.',
      ],
    },
    {
      id: 'kupoprodaja-vozila',
      heading: '4. Kupoprodaja vozila',
      paragraphs: [
        'MojAutoDiler nije ugovorna strana u kupoprodaji oglašenih vozila.',
        'Kupac i prodavac samostalno dogovaraju cenu, način plaćanja, pregled vozila, predaju dokumentacije, prenos vlasništva i ostale uslove kupoprodaje.',
        'Za izvršenje ugovorenih obaveza odgovaraju ugovorne strane, u skladu sa važećim propisima.',
        'MojAutoDiler ne obrađuje kupoprodajna plaćanja, ne garantuje izvršenje ugovora i ne preuzima ugovorne obaveze prodavca.',
      ],
    },
    {
      id: 'tehnicka-ispravnost-i-istorija-vozila',
      heading: '5. Tehnička ispravnost i istorija vozila',
      paragraphsBeforeBullets: [
        'Objavljivanje vozila na MojAutoDiler.com ne predstavlja stručni tehnički pregled, sertifikaciju ili garanciju njegove ispravnosti.',
        'MojAutoDiler ne pruža garanciju za:',
      ],
      bullets: [
        'Tehničku ili mehaničku ispravnost vozila.',
        'Tačnost prikazane kilometraže.',
        'Odsustvo prethodnih oštećenja ili saobraćajnih nezgoda.',
        'Potpunost servisne istorije.',
        'Autentičnost i potpunost dokumentacije.',
        'Nepostojanje pravnih ograničenja, tereta ili sporova.',
        'Usklađenost stvarnog stanja vozila sa opisom oglasa.',
      ],
      paragraphsAfterBullets: [
        'Kupcima se preporučuje nezavisan pregled vozila, provera dokumentacije i dostupne istorije pre kupovine.',
      ],
    },
    {
      id: 'partnerske-usluge-i-carvertical',
      heading: '6. Partnerske usluge i carVertical',
      paragraphs: [
        'MojAutoDiler može sadržati linkove ka nezavisnim partnerskim uslugama, uključujući carVertical, koje omogućavaju dodatnu proveru dostupnih podataka o istoriji vozila.',
        'Takve usluge pružaju treća lica prema sopstvenim uslovima korišćenja i pravilima privatnosti.',
        'MojAutoDiler ne izrađuje carVertical izveštaje i ne garantuje sadržaj, potpunost ili dostupnost podataka koje pružaju nezavisni servisi.',
        'Pojedini partnerski linkovi mogu biti komercijalne prirode, što znači da MojAutoDiler može ostvariti proviziju kada korisnik kupi partnersku uslugu.',
      ],
    },
    {
      id: 'besplatno-koriscenje-platforme',
      heading: '7. Besplatno korišćenje platforme',
      paragraphs: [
        'Pregled oglasa i informacija na MojAutoDiler.com trenutno je besplatan.',
        'Platforma trenutno ne ostvaruje prihod, ali može koristiti partnerske i promotivne sadržaje radi podrške svom radu.',
        'Besplatno korišćenje ne umanjuje prava korisnika koja proizlaze iz važećih propisa.',
      ],
    },
    {
      id: 'ogranicenje-odgovornosti',
      heading: '8. Ograničenje odgovornosti',
      paragraphs: [
        'MojAutoDiler ne preuzima ugovorne obaveze prodavca i ne pruža samostalnu garanciju za vozila oglašena na platformi.',
        'U meri dozvoljenoj zakonom, MojAutoDiler ne odgovara za štetu koja nastane isključivo usled netačnih informacija dostavljenih od nezavisnog oglašivača, neispunjenja obaveza prodavca ili sporova iz kupoprodajnog odnosa u kojem MojAutoDiler nije učestvovao.',
        'Ovo obaveštenje ne isključuje niti ograničava odgovornost koja se prema prinudnim propisima ne može isključiti ili ograničiti, uključujući odgovornost za sopstvene protivpravne radnje ili propuste kada je takva odgovornost utvrđena.',
      ],
    },
    {
      id: 'preporuke-kupcima',
      heading: '9. Preporuke kupcima',
      paragraphsBeforeBullets: ['Pre kupovine preporučujemo da kupac:'],
      bullets: [
        'Lično pregleda vozilo i proveri njegov identitet.',
        'Proveri VIN i dostupnu istoriju vozila.',
        'Organizuje nezavisan tehnički pregled.',
        'Proveri dokumentaciju, vlasništvo i eventualna pravna ograničenja.',
        'Potvrdi konačnu cenu i uslove prodaje direktno sa prodavcem.',
        'Ne vrši uplate unapred bez odgovarajuće provere i dokumentacije.',
      ],
    },
    {
      id: 'prijava-nepravilnosti',
      heading: '10. Prijava nepravilnosti',
      paragraphs: [
        'Ako primetite netačne informacije, sumnjiv oglas, neovlašćeno korišćenje fotografija ili druge nepravilnosti, možete kontaktirati MojAutoDiler putem zvanične kontakt stranice.',
        'Prijave će biti razmotrene u skladu sa raspoloživim informacijama i važećim propisima.',
      ],
      showContactLink: true,
    },
    {
      id: 'prava-korisnika-i-vazeci-propisi',
      heading: '11. Prava korisnika i važeći propisi',
      paragraphs: [
        'Ništa u ovom obaveštenju ne ograničava zakonska prava potrošača niti druga prava korisnika koja se ne mogu isključiti ugovorom ili jednostranim obaveštenjem.',
        'Na rad platforme primenjuju se odgovarajući važeći propisi Republike Srbije.',
      ],
    },
    {
      id: 'izmene-obavestenja',
      heading: '12. Izmene obaveštenja',
      paragraphs: [
        'MojAutoDiler može ažurirati ovo obaveštenje radi usklađivanja sa promenama načina rada platforme, poslovnih odnosa ili zakonskih zahteva.',
        'Važeća verzija biće dostupna na ovoj stranici.',
      ],
    },
  ] satisfies readonly LegalSection[],
} as const;
