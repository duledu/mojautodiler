import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { getVehiclesByBrand } from '@/lib/db/vehicles';
import VehicleCard from '@/components/vehicle/VehicleCard';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import BrandSiloJsonLd from '@/components/seo/BrandSiloJsonLd';
import Reveal from '@/components/ui/Reveal';
import type { Metadata } from 'next';

// ── ISR — revalidate hourly so new vehicles appear within 60 minutes ──────────
// (NOT force-dynamic — these are SEO landing pages that benefit from caching)
export const revalidate = 3600;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');

// ── Supported brand slugs ─────────────────────────────────────────────────────

type BrandSlug = 'bmw' | 'audi' | 'volkswagen' | 'mercedes-benz' | 'skoda';

interface BrandLocaleContent {
  readonly metaTitle:   string;
  readonly metaDesc:    string;
  readonly h1:          string;
  readonly intro:       string;
  readonly overview:    string;
  readonly whyBuy:      string[];
  readonly faq:         Array<{ readonly q: string; readonly a: string }>;
}

interface BrandDef {
  readonly displayName: string;
  readonly dbName:      string;   // exact brand string stored in DB (case-insensitive query)
  readonly sr:          BrandLocaleContent;
  readonly sq:          BrandLocaleContent;
}

const BRANDS: Record<BrandSlug, BrandDef> = {
  bmw: {
    displayName: 'BMW',
    dbName:      'BMW',
    sr: {
      metaTitle:  'BMW automobili iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:   'Pažljivo odabrani uvozni BMW automobili u Srbiji. Serije 3, 5, X3, X5 i više sa proverenim poreklom i transparentnom istorijom servisa.',
      h1:         'BMW automobili iz uvoza',
      intro:      'Pronađite pažljivo odabrane uvozne BMW automobile sa proverenim poreklom na MojAutoDiler platformi. Svako vozilo dolazi sa dokumentovanom istorijom i transparentnom kupovinom bez pritiska.',
      overview:   'BMW (Bavarian Motor Works) je jedan od vodećih proizvođača premium automobila na svetu. Modeli kao što su Serija 3, Serija 5, X3 i X5 poznati su po izuzetnim voznim karakteristikama, naprednoj tehnologiji i luksuznom enterijeru. BMW vozila iz uvoza — posebno iz Nemačke i Švajcarske — često imaju uredniju servisnu istoriju i nižu kilometražu od onih koji su ceo vek proveli na Balkanu.',
      whyBuy:     [
        'Izvanredna vozna dinamika i sportski karakter',
        'Napredna bezbednosna i infotejnment tehnologija',
        'Visoka vrednost pri preprodaji',
        'Dobra dostupnost delova i servisnih usluga',
      ],
      faq: [
        {
          q: 'Da li su BMW vozila pouzdana za svakodnevnu upotrebu?',
          a: 'BMW vozila su pouzdana kada se redovno servisiraju prema propisanim intervalima. Ključno je proveriti kompletnu servisnu knjižicu i istoriju vozila pre kupovine. Modeli poput Serije 3 i Serije 5 sa benzinskim motorima važe za posebno pouzdane.',
        },
        {
          q: 'Koji BMW modeli su najpopularniji u Srbiji?',
          a: 'Najtraženiji BMW modeli u Srbiji su Serija 3 (E90, F30) i Serija 5 (E60, F10) zbog kombinacije veličine, performansi i cene. SUV modeli X3 i X5 su sve popularniji zbog visoke pozicije sedenja i praktičnosti.',
        },
        {
          q: 'Šta treba proveriti pre kupovine polovnog BMW-a?',
          a: 'Pre kupovine obavezno proverite: kompletnu servisnu istoriju, stanje ulja i rashladne tečnosti, istoriju sudara putem VIN broja, stanje guma i kočnica, rad svih elektronskih sistema i klimatizacije. Preporučujemo profesionalni tehnički pregled pre konačne odluke.',
        },
        {
          q: 'Da li MojAutoDiler nudi BMW automobile iz Nemačke?',
          a: 'Da, značajan deo naše ponude čine uvozna vozila iz Nemačke i Švajcarske. Sva vozila prolaze selekciju pre objave, a poreklo i istorija se transparentno komuniciraju u svakom oglasu.',
        },
      ],
    },
    sq: {
      metaTitle:  'Automjete BMW nga importi në Serbi | Moj Auto Diler',
      metaDesc:   'Automjete BMW të zgjedhura me kujdes nga importi në Serbi. Seria 3, 5, X3, X5 dhe më shumë, me origjinë të verifikuar dhe histori transparente servisi.',
      h1:         'Automjete BMW nga importi',
      intro:      'Gjeni automjete BMW nga importi me origjinë të verifikuar në platformën MojAutoDiler. Çdo automjet vjen me histori të dokumentuar dhe blerje transparente pa presion.',
      overview:   'BMW (Bavarian Motor Works) është një nga prodhuesit kryesorë të automjeteve premium në botë. Modelet si Seria 3, Seria 5, X3 dhe X5 njihen për karakteristikat e jashtëzakonshme të ngasjes, teknologjinë e avancuar dhe interiorin luksoz.',
      whyBuy:     [
        'Dinamikë e shkëlqyer e drejtimit',
        'Teknologji e avancuar sigurie dhe infotejnment',
        'Vlerë e lartë ri-shitjeje',
        'Disponueshmëri e mirë e pjesëve dhe shërbimeve',
      ],
      faq: [
        {
          q: 'A janë automjetet BMW të besueshme për përdorim të përditshëm?',
          a: 'Automjetet BMW janë të besueshme kur servisohen rregullisht sipas intervaleve të përcaktuara. Është thelbësore të kontrollohet libri i plotë i servisit dhe historia e automjetit para blerjes.',
        },
        {
          q: 'Cilat modele BMW janë më të njohurat në Serbi?',
          a: 'Modelet BMW më të kërkuara në Serbi janë Seria 3 (E90, F30) dhe Seria 5 (E60, F10) për shkak të kombinimit të madhësisë, performancës dhe çmimit. SUV modelet X3 dhe X5 janë gjithnjë e më të njohura.',
        },
        {
          q: 'Çfarë duhet kontrolluar para blerjes së një BMW të përdorur?',
          a: 'Para blerjes kontrolloni domosdoshmërisht: historinë e plotë të servisit, gjendjen e vajit dhe lëngut ftohës, historinë e aksidenteve përmes numrit VIN, gjendjen e gomave dhe frenave, funksionimin e të gjitha sistemeve elektronike.',
        },
      ],
    },
  },

  audi: {
    displayName: 'Audi',
    dbName:      'Audi',
    sr: {
      metaTitle:  'Audi automobili iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:   'Pažljivo odabrani uvozni Audi automobili u Srbiji. A4, A6, Q5, Q7 i više sa proverenim poreklom i quattro pogonom. Transparentna kupovina.',
      h1:         'Audi automobili iz uvoza',
      intro:      'Audi vozila kombinuju eleganciju, visoke performanse i inovativnu tehnologiju. Na MojAutoDiler platformi pronađite uvozne Audi automobile sa proverenim poreklom i kompletnom dokumentacijom.',
      overview:   'Audi AG, deo Volkswagen Grupe, važi za jednog od premijum proizvođača u segmentu luksuznih automobila. Modeli A4, A6 i SUV Q5 i Q7 su među najpopularnijima. Audi quattro pogon na sva četiri točka postao je sinonim za vrhunsku kontrolu i sigurnost. Uvozna Audi vozila, posebno iz Nemačke i Austrije, često dolaze sa bogatom opremom i niskom kilometražom.',
      whyBuy:     [
        'Quattro pogon za maksimalnu sigurnost i kontrolu',
        'Premium interijer sa vrhunskim materijalima',
        'Napredna MMI tehnologija i digitalni kokpit',
        'Širok spektar modela za sve potrebe',
      ],
      faq: [
        {
          q: 'Da li je skupo održavati Audi?',
          a: 'Troškovi održavanja Audija su umereni do viši za premium segment. Redovni servis po propisanim intervalima je ključan. Generalno, benzinski motori su jeftiniji za servis od dizelaša i hibrida. Delovi su lako dostupni zahvaljujući Volkswagen Grupi.',
        },
        {
          q: 'Koji Audi model je najpouzdaniji za kupovinu kao polovni auto?',
          a: 'Audi A4 B8 (2008–2016) i A6 C7 (2011–2018) generalno važe za pouzdane i dobro zastupljene na tržištu. Preporučujemo modele sa benzinskim 2.0 TFSI motorom koji je pouzdaniji od dizelaša iste generacije.',
        },
        {
          q: 'Šta znači Audi Quattro i da li je potreban?',
          a: 'Quattro je Audijev sistem pogona na sva četiri točka koji obezbeđuje bolju trakciju i sigurnost, posebno u zimskim uslovima. Za balkanske uslove vožnje preporučujemo quattro, mada FWD (prednji pogon) verzije su povoljnije za nabavku i servis.',
        },
        {
          q: 'Da li MojAutoDiler ima Audi vozila iz uvoza sa quattro pogonom?',
          a: 'Da, u našoj ponudi regularno imamo Audi vozila sa quattro pogonom uvezena iz Nemačke i Austrije. Svaki oglas jasno prikazuje vrstu pogona, poreklo i kompletne specifikacije.',
        },
      ],
    },
    sq: {
      metaTitle:  'Automjete Audi nga importi në Serbi | Moj Auto Diler',
      metaDesc:   'Automjete Audi të zgjedhura me kujdes nga importi. A4, A6, Q5, Q7 dhe më shumë me origjinë të verifikuar dhe quattro tërheqje. Blerje transparente.',
      h1:         'Automjete Audi nga importi',
      intro:      'Automjetet Audi kombinojnë elegancën, performancën e lartë dhe teknologjinë inovative. Gjeni automjete Audi nga importi me origjinë të verifikuar në MojAutoDiler.',
      overview:   'Audi AG, pjesë e Volkswagen Group, konsiderohet si një nga prodhuesit premium të automjeteve luksoz. Modelet A4, A6 dhe SUV Q5 e Q7 janë ndër më të njohurat. Sistemi quattro i tërheqjes me të katër rrotat është bërë sinonim i kontrollit dhe sigurisë superiore.',
      whyBuy:     [
        'Tërheqje quattro për siguri dhe kontroll maksimal',
        'Interior premium me materiale të shkëlqyera',
        'Teknologji e avancuar MMI dhe kokpit digjital',
        'Gamë e gjerë modelesh për të gjitha nevojat',
      ],
      faq: [
        {
          q: 'A është e shtrenjtë mirëmbajtja e Audit?',
          a: 'Kostot e mirëmbajtjes së Audit janë të moderuara deri të larta për segmentin premium. Shërbimi i rregullt sipas intervaleve të përcaktuara është thelbësor. Motorët benzin janë zakonisht më pak të kushtueshëm për shërbim sesa ata diesel.',
        },
        {
          q: 'Cili model Audi është më i besueshëm si automjet i përdorur?',
          a: 'Audi A4 B8 (2008-2016) dhe A6 C7 (2011-2018) janë përgjithësisht të besueshëm dhe të mirë-përfaqësuar në treg. Rekomandojmë modelet me motor benzin 2.0 TFSI.',
        },
        {
          q: 'Çfarë do të thotë Audi Quattro?',
          a: 'Quattro është sistemi i tërheqjes me të katër rrotat i Audit që siguron trakcion dhe siguri më të mirë, veçanërisht në kushte dimërore.',
        },
      ],
    },
  },

  volkswagen: {
    displayName: 'Volkswagen',
    dbName:      'Volkswagen',
    sr: {
      metaTitle:  'Volkswagen automobili iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:   'Pažljivo odabrani uvozni Volkswagen automobili. Golf, Passat, Tiguan i više sa proverenim poreklom iz Nemačke. Transparentna kupovina u Srbiji.',
      h1:         'Volkswagen automobili iz uvoza',
      intro:      'Volkswagen je najtraženiji evropski brend na srpskom tržištu. Na MojAutoDiler platformi pronađite uvozne VW automobile — Golf, Passat, Tiguan i druge modele — sa proverenim poreklom i dokumentovanom istorijom.',
      overview:   'Volkswagen (VW), osnovan 1937. godine u Nemačkoj, danas je jedan od najvećih proizvođača automobila na svetu. Golf je decenijama najprodavaniji auto u Srbiji i Evropi, poznat po pouzdanosti, ekonomičnosti i dobroj vrednosti za novac. Passat je idealan porodični auto, dok Tiguan i T-Roc osvajaju kupce koji traže SUV sa VW kvalitetom. VW vozila iz Nemačke su naročito popularna zbog odlično dokumentovane istorije servisa.',
      whyBuy:     [
        'Izvanredna pouzdanost i dugovečnost',
        'Niska potrošnja goriva, posebno kod TDI motora',
        'Odlična servisna mreža i dostupnost delova',
        'Visoka preprodajna vrednost',
      ],
      faq: [
        {
          q: 'Koji Volkswagen model je najpopularniji u Srbiji?',
          a: 'Volkswagen Golf je apsolutni lider popularnosti u Srbiji godinama. Golf 6 (2009–2013) i Golf 7 (2013–2020) su posebno traženi zbog pouzdanosti, ekonomičnosti i dobre opreme. Passat B8 i Tiguan su popularni u porodičnom segmentu.',
        },
        {
          q: 'Šta proveriti pre kupovine polovnog Volkswagen Golfa?',
          a: 'Pre kupovine proverite: servisnu knjižicu i redovnost zamene ulja, stanje DSG menjača (ako je automatik), stanje transmisije i diferencijala, istoriju sudara putem VIN broja, funkcionisanje EPC sistema i DPF filtera kod TDI modela.',
        },
        {
          q: 'Da li su VW TDI (dizel) motori pouzdani?',
          a: 'VW TDI dizel motori su generalno pouzdani i ekonomični kada se redovno servisiraju. Ključno je proveriti stanje DPF filtera i EGR ventila. Preporučujemo da se uvek proverava da li je particulate filter zatvaran ili uklonjen.',
        },
        {
          q: 'Koja je razlika između Golfa 6 i Golfa 7?',
          a: 'Golf 7 (2013–2020) je bolji u gotovo svakom aspektu: moderniji enterijer, efikasniji motori, bolja aerodinamika i napredni bezbednosni sistemi. Golf 6 je jeftiniji ali i dalje izuzetno pouzdan izbor. Golf 7 preporučujemo kao bolji dugoročni ulog.',
        },
      ],
    },
    sq: {
      metaTitle:  'Automjete Volkswagen nga importi në Serbi | Moj Auto Diler',
      metaDesc:   'Automjete Volkswagen të zgjedhura me kujdes nga importi. Golf, Passat, Tiguan dhe më shumë me origjinë të verifikuar nga Gjermania.',
      h1:         'Automjete Volkswagen nga importi',
      intro:      'Volkswagen është brendi europian më i kërkuar në tregun serb. Gjeni automjete VW nga importi — Golf, Passat, Tiguan — me origjinë të verifikuar dhe histori të dokumentuar.',
      overview:   'Volkswagen (VW), themeluar në 1937 në Gjermani, është sot njëri nga prodhuesit më të mëdhenj të automjeteve në botë. Golf është prej dekadash automjeti më i shitur në Serbi dhe Europë, i njohur për besueshmërinë dhe ekonominë e lartë.',
      whyBuy:     [
        'Besueshmëri dhe jetëgjatësi e jashtëzakonshme',
        'Konsum i ulët i karburantit, veçanërisht motorët TDI',
        'Rrjet i mirë shërbimi dhe disponueshmëri e pjesëve',
        'Vlerë e lartë ri-shitjeje',
      ],
      faq: [
        {
          q: 'Cili model Volkswagen është më i njohur në Serbi?',
          a: 'Volkswagen Golf është lideri absolut i popullaritetit në Serbi. Golf 6 (2009-2013) dhe Golf 7 (2013-2020) janë veçanërisht të kërkuar për besueshmërinë dhe ekonominë e tyre.',
        },
        {
          q: 'Çfarë të kontrolloni para blerjes së një Volkswagen Golf të përdorur?',
          a: 'Para blerjes kontrolloni: librin e servisit dhe rregullsinë e ndërrimit të vajit, gjendjen e transmisionit DSG (nëse është automatik), historinë e aksidenteve përmes numrit VIN, funksionimin e sistemit EPC.',
        },
        {
          q: 'A janë motorët VW TDI (diesel) të besueshëm?',
          a: 'Motorët VW TDI janë përgjithësisht të besueshëm dhe ekonomikë kur servisohen rregullisht. Është e rëndësishme të kontrollohet gjendja e filtrit DPF dhe valvulës EGR.',
        },
      ],
    },
  },

  'mercedes-benz': {
    displayName: 'Mercedes-Benz',
    dbName:      'Mercedes-Benz',
    sr: {
      metaTitle:  'Mercedes-Benz automobili iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:   'Pažljivo odabrani uvozni Mercedes-Benz automobili u Srbiji. C-klasa, E-klasa, GLC i više sa proverenim poreklom. Transparentna kupovina.',
      h1:         'Mercedes-Benz automobili iz uvoza',
      intro:      'Mercedes-Benz je simbol luksuznog automobila sa više od 130 godina tradicije. Na MojAutoDiler platformi pronađite uvozne Mercedes-Benz automobile sa proverenim poreklom i transparentnom dokumentacijom.',
      overview:   'Mercedes-Benz, deo Daimler AG, jedan je od najprepoznatljivijih brendova u automobilskoj industriji. C-klasa i E-klasa su ikone premium segmenta, dok GLC i GLE osvajaju ljubitelje luksuznih SUV vozila. Mercedes vozila iz Nemačke i Švajcarske poznata su po izuzetnoj izradi, naprednim bezbednosnim sistemima i luksuznim materijalima enterijera.',
      whyBuy:     [
        'Vrhunski luksuz i premium materijali enterijera',
        'Napredni bezbednosni sistemi (PRE-SAFE, Attention Assist)',
        'Ikonski dizajn i brendirana vrednost',
        'Izvanredna udobnost i izolacija od buke',
      ],
      faq: [
        {
          q: 'Da li je skupo održavati Mercedes-Benz?',
          a: 'Mercedes-Benz vozila imaju nešto više troškove održavanja od proseka. Redovni servis je obavezan na svakih 10.000–15.000 km. Benzinski motori su generalno jeftiniji za održavanje od dizelaša. Preporučujemo proveru svih servisnih intervala pre kupovine.',
        },
        {
          q: 'Koji Mercedes modeli imaju razumne troškove održavanja?',
          a: 'C-klasa W205 sa benzinskim motorima (C180, C200) i E-klasa W213 važe za relativno razumne za segment premijum automobila. Stariji modeli kao W204 i W212 su dobar izbor uz manju inicijalnu investiciju.',
        },
        {
          q: 'Šta proveriti pre kupovine polovnog Mercedesa?',
          a: 'Obavezno proverite: kompletnu ASSYST servisnu istoriju, stanje 7G-TRONIC ili 9G-TRONIC menjača, stanje air-suspension sistema (ako postoji), status StarDiagnosis OBD dijagnostike, kao i poreklo i historiju vlasnika putem VIN broja.',
        },
        {
          q: 'Da li MojAutoDiler ima Mercedes-Benz vozila iz Nemačke?',
          a: 'Da, redovno imamo Mercedes-Benz vozila uvezena iz Nemačke i Švajcarske, sa kompletnom servisnom dokumentacijom. Sva vozila prolaze našu selekciju pre objave.',
        },
      ],
    },
    sq: {
      metaTitle:  'Automjete Mercedes-Benz nga importi në Serbi | Moj Auto Diler',
      metaDesc:   'Automjete Mercedes-Benz të zgjedhura me kujdes nga importi. Klasa C, E-klasa, GLC dhe më shumë me origjinë të verifikuar.',
      h1:         'Automjete Mercedes-Benz nga importi',
      intro:      'Mercedes-Benz është simbol i automjetit luksoz me mbi 130 vjet traditë. Gjeni automjete Mercedes-Benz nga importi me origjinë të verifikuar në MojAutoDiler.',
      overview:   'Mercedes-Benz, pjesë e Daimler AG, është njëri nga brendet më të njohura në industrinë e automjeteve. Klasa C dhe E-klasa janë ikona të segmentit premium, ndërsa GLC dhe GLE janë SUV luksoze shumë të kërkuara.',
      whyBuy:     [
        'Luksoz i shkëlqyer dhe materiale premium interiori',
        'Sisteme të avancuara sigurie (PRE-SAFE, Attention Assist)',
        'Dizajn ikonik dhe vlerë e brendit',
        'Rehati e jashtëzakonshme dhe izolim i zërit',
      ],
      faq: [
        {
          q: 'A është e shtrenjtë mirëmbajtja e Mercedes-Benz?',
          a: 'Automjetet Mercedes-Benz kanë kosto mirëmbajtjeje pak mbi mesataren. Shërbimi i rregullt është i detyrueshëm çdo 10.000-15.000 km. Motorët benzin janë përgjithësisht më pak të kushtueshëm sesa ata diesel.',
        },
        {
          q: 'Cilat modele Mercedes kanë kosto mirëmbajtjeje të arsyeshme?',
          a: 'Klasa C W205 me motorë benzin (C180, C200) dhe E-klasa W213 konsiderohen relativisht të arsyeshme për segmentin premium. Modelet e vjetra si W204 dhe W212 janë zgjedhje të mira me investim fillestar më të vogël.',
        },
        {
          q: 'Çfarë të kontrolloni para blerjes së një Mercedes të përdorur?',
          a: 'Kontrolloni domosdoshmërisht: historinë e plotë ASSYST të servisit, gjendjen e transmisionit 7G-TRONIC ose 9G-TRONIC, gjendjen e sistemit air-suspension (nëse ekziston), dhe origjinën e automjetit përmes numrit VIN.',
        },
      ],
    },
  },

  skoda: {
    displayName: 'Škoda',
    dbName:      'Škoda',
    sr: {
      metaTitle:  'Škoda automobili iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:   'Pažljivo odabrani uvozni Škoda automobili u Srbiji. Octavia, Superb, Kodiaq i više sa proverenim poreklom. Odličan kvalitet za cenu.',
      h1:         'Škoda automobili iz uvoza',
      intro:      'Škoda nudi izvanredan odnos kvaliteta i cene uz VW Gruppe pouzdanost. Na MojAutoDiler platformi pronađite uvozne Škoda automobile — Octavia, Superb, Kodiaq — sa proverenim poreklom.',
      overview:   'Škoda Auto, češki brend u sastavu Volkswagen Grupe od 1991. godine, slovi za jednog od najpouzdanijih i najekonomičnijih proizvođača u Evropi. Škoda Octavia je jedna od najprodavanijih limuzina/karavan vozila u Srbiji i Evropi. Superb nudi luksuz E-klase po ceni B-segmenta, dok je Kodiaq idealan obiteljski SUV. VW Gruppe platforma znači dostupne delove i vrhunsku servisnu podršku.',
      whyBuy:     [
        'Odličan odnos kvaliteta i cene unutar VW Grupe',
        'Prostoran enterijer i praktičan prtljažnik',
        'Niski troškovi servisa zahvaljujući VW platformi',
        'Pouzdani motori provjerene pouzdanosti',
      ],
      faq: [
        {
          q: 'Da li su Škoda vozila pouzdana?',
          a: 'Škoda vozila su generalno pouzdana zahvaljujući VW Gruppe platformi i motorima koji se dele sa Volkswagenom i Audijem. Octavia i Superb konzistentno zauzimaju visoka mesta u europskim testovima pouzdanosti. Ključno je, kao i kod svakog automobila, redovan servis prema propisanim intervalima.',
        },
        {
          q: 'Koji Škoda modeli nude najbolji kvalitet za cenu?',
          a: 'Škoda Octavia (3. generacija, 2013–2020) se smatra jednim od najboljim izborima u segmentu kompaktnih automobila — prostoran, ekonomičan i pouzdan. Superb je legendaran po prostoru i opcijama opreme koje pariraju luksuznim sedanima po znatno nižoj ceni.',
        },
        {
          q: 'Šta proveriti pri kupovini polovnog Škoda vozila?',
          a: 'Proverite kompletnu servisnu istoriju, stanje DSG menjača (ako je automatik), funkcionalnost Climatic/Climatronic klima uređaja, historiju sudara putem VIN broja i stanje korozije — posebno kod starijih modela. DPF filter kod TDI motora je važna stavka za pregled.',
        },
        {
          q: 'Da li je bolje kupiti Škoda ili Volkswagen?',
          a: 'Oba brenda koriste iste motore i platforme (VW Gruppe), tako da je pouzdanost slična. Škoda je tipično jeftinija za kupovinu i servis, dok VW može imati malo bolju preprodajnu vrednost. Izbor zavisi od budžeta i modela koji odgovaraju vašim potrebama.',
        },
      ],
    },
    sq: {
      metaTitle:  'Automjete Škoda nga importi në Serbi | Moj Auto Diler',
      metaDesc:   'Automjete Škoda të zgjedhura me kujdes nga importi. Octavia, Superb, Kodiaq me origjinë të verifikuar. Cilësi e shkëlqyer për çmimin.',
      h1:         'Automjete Škoda nga importi',
      intro:      'Škoda ofron marrëdhënie të jashtëzakonshme cilësi-çmim me besueshmërinë e VW Gruppe. Gjeni automjete Škoda nga importi — Octavia, Superb, Kodiaq — me origjinë të verifikuar në MojAutoDiler.',
      overview:   'Škoda Auto, brend çek në Volkswagen Group nga 1991, konsiderohet si njëri nga prodhuesit më të besueshëm dhe ekonomikë në Europë. Škoda Octavia është njëri nga automjetet më të shitura në Serbi dhe Europë.',
      whyBuy:     [
        'Marrëdhënie e shkëlqyer cilësi-çmim brenda VW Group',
        'Interior i gjerë dhe bagazh praktik',
        'Kosto e ulët shërbimi falë platformës VW',
        'Motorë të besueshëm të provuar',
      ],
      faq: [
        {
          q: 'A janë automjetet Škoda të besueshme?',
          a: 'Automjetet Škoda janë përgjithësisht të besueshme falë platformës VW Group dhe motorëve të ndarë me Volkswagen dhe Audi. Octavia dhe Superb marrin vazhdimisht rezultate të larta në testet europiane të besueshmërisë.',
        },
        {
          q: 'Cilët modele Škoda ofrojnë cilësinë më të mirë për çmimin?',
          a: 'Škoda Octavia (gjenerata e 3-të, 2013-2020) konsiderohet si njëri nga zgjedhjet më të mira në segmentin kompakt — me hapësirë, ekonomi dhe besueshmëri. Superb është legjendarë për hapësirën dhe opcionet e pajisjes.',
        },
        {
          q: 'Çfarë të kontrolloni kur blini një Škoda të përdorur?',
          a: 'Kontrolloni historinë e plotë të servisit, gjendjen e transmisionit DSG (nëse është automatik), funksionimin e sistemit të klimatizimit dhe historinë e aksidenteve përmes numrit VIN.',
        },
      ],
    },
  },
};

export const BRAND_SLUGS = Object.keys(BRANDS) as BrandSlug[];

// ── Static params — pre-generates all brand+locale combinations at build ──────

export function generateStaticParams() {
  return BRAND_SLUGS.flatMap((brand) => [
    { locale: 'sr', brand },
    { locale: 'sq', brand },
  ]);
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string; brand: string }> },
): Promise<Metadata> {
  const { locale, brand } = await params;
  const def = BRANDS[brand as BrandSlug];
  if (!def || !isValidLocale(locale)) return {};

  const content  = locale === 'sq' ? def.sq : def.sr;
  const canonical = `/${locale}/cars/${brand}`;

  return {
    title:       { absolute: content.metaTitle },
    description: content.metaDesc,
    robots: {
      index:   true,
      follow:  true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    alternates: {
      canonical,
      languages: {
        sr: `/sr/cars/${brand}`,
        sq: `/sq/cars/${brand}`,
      },
    },
    openGraph: {
      type:        'website',
      title:       content.metaTitle,
      description: content.metaDesc,
      url:         `${SITE}${canonical}`,
      siteName:    'Moj Auto Diler',
      // Brand-specific OG image at /public/og/brand-{slug}.jpg (1200×630).
      // File is generated by scripts/generate-og-images.mjs.
      // Falls back to the site-wide OG image if the brand file does not exist.
      images: [
        { url: `/og/brand-${brand}.jpg`, width: 1200, height: 630, alt: content.metaTitle },
        { url: '/og-image.jpg',          width: 1200, height: 630, alt: 'Moj Auto Diler' },
      ],
    },
    twitter: {
      card:        'summary_large_image',
      title:       content.metaTitle,
      description: content.metaDesc,
      // FIX #1: images was missing — Twitter/X rendered text-only cards.
      // FIX #3: use brand-specific image, same as OG.
      images:      [`${SITE}/og/brand-${brand}.jpg`],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BrandPage(
  { params }: { readonly params: Promise<{ locale: string; brand: string }> },
) {
  const { locale, brand } = await params;
  if (!isValidLocale(locale)) notFound();

  const def = BRANDS[brand as BrandSlug];
  if (!def) notFound();

  const content  = locale === 'sq' ? def.sq : def.sr;
  const t        = getTranslations(locale);
  const vehicles = await getVehiclesByBrand(def.dbName);
  const pageUrl  = `${SITE}/${locale}/cars/${brand}`;
  const isSq     = locale === 'sq';

  const breadcrumbs = [
    { name: isSq ? 'Kryefaqja' : 'Početna',   url: `${SITE}/${locale}` },
    { name: isSq ? 'Automjetet' : 'Vozila',    url: `${SITE}/${locale}/inventory` },
    { name: def.displayName,                    url: pageUrl },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <BrandSiloJsonLd
        brandName={def.displayName}
        pageUrl={pageUrl}
        pageTitle={content.metaTitle}
        description={content.metaDesc}
        vehicles={vehicles}
        locale={locale}
        faq={content.faq}
      />

      <main className="min-h-screen bg-(--color-bg) pt-20">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-(--color-border)">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-(--color-text-muted)">
            <Link href={`/${locale}`} className="hover:text-(--color-text) transition-colors">
              {isSq ? 'Kryefaqja' : 'Početna'}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/inventory`} className="hover:text-(--color-text) transition-colors">
              {isSq ? 'Automjetet' : 'Vozila'}
            </Link>
            <span>/</span>
            <span className="text-(--color-text)">{def.displayName}</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-20">

          {/* ── Hero ───────────────────────────────────────────────────────── */}
          <section>
            <Reveal>
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--accent-border) bg-(--accent-soft) px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-(--accent-dark)">
                  {def.displayName} · {isSq ? 'Import' : 'Uvoz'}
                </div>
                <h1
                  className="text-3xl font-black leading-tight text-(--color-text) sm:text-5xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {content.h1}
                </h1>
                <p className="mt-4 text-base leading-7 text-(--color-text-muted) sm:text-lg sm:leading-8">
                  {content.intro}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/inventory`}
                    className="btn-gold inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm"
                  >
                    {isSq ? 'Shiko të gjitha' : 'Sva vozila'}
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="btn-outline inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm"
                  >
                    {isSq ? 'Kontakto' : 'Kontakt'}
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ── Vehicle grid ───────────────────────────────────────────────── */}
          <section>
            <Reveal>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <div className="divider-gold mb-3" />
                  <h2
                    className="text-2xl font-black text-(--color-text) sm:text-3xl"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {vehicles.length > 0
                      ? isSq
                        ? `${vehicles.length} ${def.displayName} ${vehicles.length === 1 ? 'automjet' : 'automjete'} në ofertë`
                        : `${vehicles.length} ${def.displayName} ${vehicles.length === 1 ? 'vozilo' : 'vozila'} u ponudi`
                      : isSq
                        ? `${def.displayName} automjetet`
                        : `${def.displayName} vozila`}
                  </h2>
                </div>
                <Link
                  href={`/${locale}/inventory`}
                  className="shrink-0 text-sm font-bold text-(--accent-dark) transition hover:text-(--accent) flex items-center gap-1.5"
                >
                  {isSq ? 'Të gjitha' : 'Sva vozila'}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>

            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                {vehicles.map((vehicle, i) => (
                  <Reveal key={vehicle.id} delay={i * 70}>
                    <VehicleCard vehicle={vehicle} locale={locale} t={t} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-(--color-border) bg-white p-10 text-center">
                <p className="text-(--color-text-muted) text-sm">
                  {isSq
                    ? `Aktualisht nuk ka automjete ${def.displayName} në ofertë. Kontaktoni na për informacion.`
                    : `Trenutno nema ${def.displayName} vozila u ponudi. Kontaktirajte nas za više informacija.`}
                </p>
                <Link
                  href={`/${locale}/contact`}
                  className="btn-gold mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
                >
                  {isSq ? 'Kontakto' : 'Kontaktiraj nas'}
                </Link>
              </div>
            )}
          </section>

          {/* ── Brand overview ─────────────────────────────────────────────── */}
          <section>
            <Reveal>
              <div className="rounded-3xl border border-(--color-border) bg-white p-6 sm:p-8">
                <div className="divider-gold mb-5" />
                <h2
                  className="mb-4 text-xl font-black text-(--color-text) sm:text-2xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isSq ? `Rreth ${def.displayName}` : `O brendu ${def.displayName}`}
                </h2>
                <p className="text-sm leading-7 text-(--color-text-muted) sm:text-base sm:leading-8">
                  {content.overview}
                </p>
              </div>
            </Reveal>
          </section>

          {/* ── Why buy section ────────────────────────────────────────────── */}
          <section>
            <Reveal>
              <div className="divider-gold mb-5" />
              <h2
                className="mb-6 text-xl font-black text-(--color-text) sm:text-2xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isSq
                  ? `Pse të blini ${def.displayName} në MojAutoDiler`
                  : `Zašto kupiti ${def.displayName} na MojAutoDiler`}
              </h2>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {content.whyBuy.map((point, i) => (
                <Reveal key={point} delay={i * 80}>
                  <div className="flex items-start gap-3 rounded-2xl border border-(--color-border) bg-white p-4">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-(--accent)" />
                    <p className="text-sm leading-6 text-(--color-text-2)">{point}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ── FAQ ────────────────────────────────────────────────────────── */}
          <section>
            <Reveal>
              <div className="divider-gold mb-5" />
              <h2
                className="mb-6 text-xl font-black text-(--color-text) sm:text-2xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isSq
                  ? `Pyetjet e shpeshta — ${def.displayName}`
                  : `Česta pitanja — ${def.displayName}`}
              </h2>
            </Reveal>
            <div className="space-y-3">
              {content.faq.map((item, i) => (
                <Reveal key={item.q} delay={i * 60}>
                  <details className="group rounded-2xl border border-(--color-border) bg-white">
                    <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-(--color-text) marker:hidden list-none">
                      <span>{item.q}</span>
                      <ChevronDown
                        size={16}
                        className="shrink-0 text-(--color-text-muted) transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <div className="border-t border-(--color-border) px-5 py-4">
                      <p className="text-sm leading-7 text-(--color-text-muted)">{item.a}</p>
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ── CTA ────────────────────────────────────────────────────────── */}
          <Reveal>
            <section className="rounded-3xl border border-(--accent-border) bg-(--accent-soft) p-6 sm:p-8 text-center">
              <h2
                className="text-xl font-black text-(--color-text) sm:text-2xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isSq
                  ? `Kërkoni automjet ${def.displayName}?`
                  : `Tražite ${def.displayName} automobil?`}
              </h2>
              <p className="mt-3 text-sm leading-7 text-(--color-text-muted)">
                {isSq
                  ? 'Kontaktoni na dhe do t\'ju ndihmojmë të gjeni automjetin e duhur.'
                  : 'Kontaktirajte nas i pomoći ćemo vam da pronađete pravo vozilo.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/${locale}/inventory`}
                  className="btn-gold inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm"
                >
                  {isSq ? 'Shiko ofertën' : 'Pogledaj ponudu'}
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="btn-outline inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-sm"
                >
                  {isSq ? 'Kontakto' : 'Kontaktiraj nas'}
                </Link>
              </div>
            </section>
          </Reveal>

        </div>
      </main>
    </>
  );
}
