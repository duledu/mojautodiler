import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronRight, User, Fuel } from 'lucide-react';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { getVehiclesByModel } from '@/lib/db/vehicles';
import VehicleCard from '@/components/vehicle/VehicleCard';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ModelSiloJsonLd from '@/components/seo/ModelSiloJsonLd';
import Reveal from '@/components/ui/Reveal';
import type { Metadata } from 'next';

// ── ISR — revalidate hourly so new inventory appears within 60 minutes ────────
export const revalidate = 3600;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');

// ── Types ─────────────────────────────────────────────────────────────────────

type ModelSlug =
  | 'golf-7'
  | 'golf-6'
  | 'tiguan'
  | 'octavia'
  | 'audi-a4'
  | 'bmw-x3';

interface ModelLocaleContent {
  readonly metaTitle:    string;
  readonly metaDesc:     string;
  readonly h1:           string;
  readonly intro:        string;
  readonly overview:     string;
  readonly whyBuy:       string[];
  readonly buyerProfile: string;
  readonly fuelInfo:     string;
  readonly faq:          Array<{ readonly q: string; readonly a: string }>;
}

interface ModelDef {
  readonly displayName:  string;
  readonly brandDisplay: string;
  readonly dbBrand:      string;
  readonly modelAliases: string[];
  readonly brandSlug:    string;
  readonly sr:           ModelLocaleContent;
  readonly sq:           ModelLocaleContent;
}

// ── Model definitions ─────────────────────────────────────────────────────────

const MODELS: Record<ModelSlug, ModelDef> = {
  'golf-7': {
    displayName:  'Golf 7',
    brandDisplay: 'Volkswagen',
    dbBrand:      'Volkswagen',
    modelAliases: ['Golf 7', 'Golf VII'],
    brandSlug:    'volkswagen',
    sr: {
      metaTitle:    'Volkswagen Golf 7 iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:     'Kupite uvozni Volkswagen Golf 7 (Golf VII, 2013–2020) sa proverenim poreklom u Srbiji. Aktuelna ponuda, kompletna dokumentacija i transparentna kupovina.',
      h1:           'Volkswagen Golf 7 iz uvoza',
      intro:        'Volkswagen Golf 7 je decenijama najprodavaniji automobil u Srbiji i jedan od najpopularnijih u Evropi. Na MojAutoDiler platformi pronađite pažljivo odabrane uvozne Golf 7 primjerke sa proverenim poreklom, kompletnom servisnom dokumentacijom i transparentnom kupovinom bez pritiska.',
      overview:     'Volkswagen Golf Mk7 (sedma generacija) proizveden je od 2013. do 2020. godine, zasnovan na MQB platformi VW Grupe. Dostupan je sa benzinskim motorima 1.0 TSI, 1.2 TSI, 1.4 TSI i 2.0 TSI (GTI), te dizel agregatima 1.6 TDI i 2.0 TDI — u manuelnoj i DSG automatskoj varijanti. Sedma generacija donela je unapređenu aerodinamiku, smanjenu masu karoserije i bolje ocene na Euro NCAP testu bezbednosti (5 zvezdica). Golf 7 uvezen iz Nemačke ili Švajcarske posebno je tražen zbog urednih servisnih knjižica i dokumentovane istorije vlasništva.',
      whyBuy: [
        'Najprodavaniji kompaktni automobil u Srbiji — laka preprodaja i šira tražnja',
        'MQB platforma: unapređena bezbednost, aerodinamika i manja potrošnja od prethodnika',
        'Široka ponuda motora od ekonomičnog 1.6 TDI do sportskog Golf GTI',
        'Odlična mreža servisera i dostupnost originalnih Volkswagen delova u celoj Srbiji',
        'Visoka retenziona vrednost — Golf 7 drži cenu bolje od mnogih konkurenata',
      ],
      buyerProfile: 'Golf 7 je savršen za mlađe profesionalce, porodice sa jednim detetom i svakodnevne gradske i međugradske vozače koji žele pouzdanost uz razumne troškove održavanja. Posebno ga biraju kupci kojima je bitna preprodajna vrednost i svestranost vozila.',
      fuelInfo:     'Prosečna potrošnja: 1.6 TDI oko 5,0–6,5 L/100 km, 1.4 TSI oko 6,0–7,5 L/100 km, 2.0 TDI oko 5,5–6,8 L/100 km. Gradska potrošnja je 10–20% viša od mešovitog ciklusa.',
      faq: [
        {
          q: 'Koja je razlika između Golf 6 i Golf 7?',
          a: 'Golf 7 je superiorniji od prethodnika: baziran na lakšoj MQB platformi, ima ekonomičnije motore, bolju aerodinamiku i naprednije bezbednosne sisteme (5 zvezdica Euro NCAP). Enterijer je moderniji sa kvalitetnijim materijalima. Golf 6 je jeftinija opcija ali i dalje odlično vozilo.',
        },
        {
          q: 'Da li je Golf 7 pouzdan za dugoročnu upotrebu?',
          a: 'Golf 7 je, uz redovne servisne intervale, generalno pouzdan automobil. Benzinski 1.4 TSI i 1.0 TSI motori važe za posebno pouzdane. Kod TDI dizel modela pažnju posvetite stanju DPF filtera i EGR ventila. DSG menjač je robustan uz zamenu ulja na propisanim intervalima.',
        },
        {
          q: 'Koji motor Golf 7 preporučujete?',
          a: 'Za gradsku vožnju i ekonomičnost: 1.6 TDI ili 1.4 TSI. Za sportski karakter uz ekonomičnost: 2.0 TDI ili 2.0 TSI (GTI). Svi motori su dobro zastupljeni u Srbiji što olakšava servis.',
        },
        {
          q: 'Da li MojAutoDiler ima Golf 7 uvezene iz Nemačke?',
          a: 'Da, znatan deo naše ponude čine Golf 7 uvezeni iz Nemačke i Švajcarske — tržišta poznata po urednim servisnim knjižicama i transparentnoj istoriji. Sve informacije o poreklu i dokumentaciji vidljive su u svakom oglasu.',
        },
      ],
    },
    sq: {
      metaTitle:    'Volkswagen Golf 7 nga importi në Serbi | Moj Auto Diler',
      metaDesc:     'Bleni Volkswagen Golf 7 (Golf VII, 2013–2020) nga importi me origjinë të verifikuar në Serbi. Ofertë aktuale, dokumentacion i plotë dhe blerje transparente.',
      h1:           'Volkswagen Golf 7 nga importi',
      intro:        'Volkswagen Golf 7 është për dekada automjeti kompakt më i shitur në Serbi dhe njëri nga më të njohurit në Evropë. Gjeni Golf 7 nga importi me origjinë të verifikuar, dokumentacion të plotë dhe blerje transparente pa presion.',
      overview:     'Volkswagen Golf Mk7 (gjenerata e shtatë) u prodhua nga 2013 deri 2020, bazuar në platformën MQB të VW Group. Disponohet me motorë benzin 1.0 TSI, 1.2 TSI, 1.4 TSI dhe 2.0 TSI (GTI), si dhe diesel 1.6 TDI dhe 2.0 TDI — në variant manual dhe automatik DSG. Gjenerata e shtatë solli aerodinamikë të përmirësuar, peshë të reduktuar dhe vlerësim më të mirë Euro NCAP (5 yje). Golf 7 nga Gjermania ose Zvicra është veçanërisht i kërkuar për librat e rregullt të servisit.',
      whyBuy: [
        'Automjeti kompakt më i shitur në Serbi — rishitje e lehtë dhe kërkesë e gjerë',
        'Platforma MQB: siguri e përmirësuar, aerodinamikë dhe konsum më i ulët se paraardhësi',
        'Gamë e gjerë motorësh nga 1.6 TDI ekonomik deri te Golf GTI sportiv',
        'Rrjet i shkëlqyer i serviseve dhe disponueshmëri e pjesëve origjinale VW',
        'Vlerë e lartë mbajtjeje — Golf 7 ruan çmimin më mirë se shumë konkurrentë',
      ],
      buyerProfile: 'Golf 7 është i përsosur për profesionistë të rinj, familje me një fëmijë dhe shoferë të përditshëm urbanë e interurbanë që duan besueshmëri me kosto mirëmbajtjeje të arsyeshme. Veçanërisht e zgjedhur nga bleresit të cilëve u intereson vlera e rishitjes dhe versatiliteti.',
      fuelInfo:     'Konsumi mesatar: 1.6 TDI rreth 5,0–6,5 L/100 km, 1.4 TSI rreth 6,0–7,5 L/100 km, 2.0 TDI rreth 5,5–6,8 L/100 km. Konsumi urban është 10–20% më i lartë se cikli i përzier.',
      faq: [
        {
          q: 'Cila është diferenca midis Golf 6 dhe Golf 7?',
          a: 'Golf 7 është superior ndaj paraardhësit: bazuar në platformën e lehtë MQB, ka motorë më ekonomikë, aerodinamikë më të mirë dhe sisteme sigurie më të avancuara (5 yje Euro NCAP). Interiori është modern me materiale cilësore. Golf 6 është opsion më i lirë por ende shumë i mirë.',
        },
        {
          q: 'A është Golf 7 i besueshëm për përdorim afatgjatë?',
          a: 'Golf 7, me servisim të rregullt, është përgjithësisht automjet i besueshëm. Motorët benzin 1.4 TSI dhe 1.0 TSI janë veçanërisht të besueshëm. Për modelet diesel TDI, kushtojini vëmendje gjendjes së filtrit DPF dhe valvulës EGR.',
        },
        {
          q: 'Cilin motor Golf 7 rekomandoni?',
          a: 'Për ngasje urbane dhe ekonomi: 1.6 TDI ose 1.4 TSI. Për karakter sportiv me ekonomi: 2.0 TDI ose 2.0 TSI (GTI). Të gjithë motorët janë të mirë-përfaqësuar në Serbi duke lehtësuar servisimin.',
        },
        {
          q: 'A ka MojAutoDiler Golf 7 nga Gjermania?',
          a: 'Po, një pjesë e konsiderueshme e ofertës sonë janë Golf 7 nga Gjermania dhe Zvicra — tregje të njohura për libra të rregullt servisi dhe histori transparente. Të gjitha informacionet janë të dukshme në çdo shpallje.',
        },
      ],
    },
  },

  'golf-6': {
    displayName:  'Golf 6',
    brandDisplay: 'Volkswagen',
    dbBrand:      'Volkswagen',
    modelAliases: ['Golf 6', 'Golf VI'],
    brandSlug:    'volkswagen',
    sr: {
      metaTitle:    'Volkswagen Golf 6 iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:     'Uvozni Volkswagen Golf 6 (Golf VI, 2009–2013) sa proverenim poreklom u Srbiji. Pouzdan i ekonomičan hatchback sa dokumentovanom istorijom servisa.',
      h1:           'Volkswagen Golf 6 iz uvoza',
      intro:        'Volkswagen Golf 6 je jedna od najpouzdanijih i najtraženijih generacija kultnog modela u Srbiji. Na MojAutoDiler platformi pronađite uvozne Golf 6 primjerke sa proverenim poreklom i kompletnom servisnom dokumentacijom.',
      overview:     'Volkswagen Golf Mk6 (šesta generacija) proizveden je od 2009. do 2013. godine na PQ35 platformi. Dostupan je sa benzinskim motorima 1.2 TSI, 1.4 TSI i 2.0 TSI (GTI), te dizel agregatima 1.6 TDI i 2.0 TDI. Ova generacija označila je uvođenje BlueMotion tehnologije za ekonomičnost i proširene bezbednosne opreme. Golf 6 je nagrađen titulom "Automobil godine 2009." i važi za jednu od najpouzdanijih Golfovih generacija sa dobro poznatim motorima i jednostavnom elektronikom.',
      whyBuy: [
        'Jedna od najpouzdanijih Golfovih generacija sa dobro poznatim motorima',
        'Povoljnija nabavna cena u odnosu na Golf 7 uz sličnu pouzdanost',
        'Jednostavnija i jeftinija za servis elektronika od novijih generacija',
        'Odlična servisna podrška i laka dostupnost rezervnih delova u Srbiji',
        'Automobil godine 2009. — industrijskim nagradama potvrđen kvalitet',
      ],
      buyerProfile: 'Golf 6 je idealan za kupce sa ograničenim budžetom koji ne žele da kompromituju pouzdanost, kao i za mlade vozače i studente koji traže ekonomičan svakodnevni auto sa niskim troškovima osiguranja i servisa.',
      fuelInfo:     'Prosečna potrošnja: 1.6 TDI oko 5,5–7,0 L/100 km, 1.4 TSI oko 6,5–8,0 L/100 km, 2.0 TDI oko 6,0–7,5 L/100 km. TDI varijante su najekonominčije za duže relacije.',
      faq: [
        {
          q: 'Da li je Golf 6 pouzdan automobil?',
          a: 'Golf 6 je generalno veoma pouzdan — posebno modeli sa 1.4 TSI i 1.6 TDI motorima. Ovi motori su dobro poznati i lako se servisiraju. Ključno je proveriti servisnu knjižicu i redovnost zamene ulja, posebno kod turbo modela.',
        },
        {
          q: 'Da li je bolje kupiti Golf 6 ili Golf 7?',
          a: 'Zavisi od budžeta i prioriteta. Golf 7 nudi moderniju tehnologiju, bolju aerodinamiku i niže emisije, ali je skuplji. Golf 6 je jeftiniji za nabavku i servis, sa jednostavnijom elektronikom. Oba su odlični izbori — Golf 6 je racionalan, Golf 7 je dugoročniji ulog.',
        },
        {
          q: 'Šta proveriti pre kupovine Golf 6?',
          a: 'Obavezno proverite: servisnu knjižicu i intervale zamene ulja, stanje DSG menjača (ako je automatik), DPF filter kod TDI motora, istoriju sudara putem VIN broja i koroziju na pragu i podvozju. Preporučujemo profesionalni pregled pre konačne odluke.',
        },
        {
          q: 'Da li MojAutoDiler ima Golf 6 iz uvoza?',
          a: 'Da, povremeno imamo Golf 6 uvezene iz Nemačke i Austrije sa kompletnom servisnom dokumentacijom. Dostupnost varira — kontaktirajte nas za aktuelnu ponudu ili pratite našu stranicu.',
        },
      ],
    },
    sq: {
      metaTitle:    'Volkswagen Golf 6 nga importi në Serbi | Moj Auto Diler',
      metaDesc:     'Golf 6 (Golf VI, 2009–2013) nga importi me origjinë të verifikuar në Serbi. Hatchback i besueshëm dhe ekonomik me histori të dokumentuar servisi.',
      h1:           'Volkswagen Golf 6 nga importi',
      intro:        'Volkswagen Golf 6 është njëra nga gjeneratat më të besueshme dhe më të kërkuara të modelit ikonik në Serbi. Gjeni Golf 6 nga importi me origjinë të verifikuar dhe dokumentacion të plotë të servisit.',
      overview:     'Volkswagen Golf Mk6 (gjenerata e gjashtë) u prodhua nga 2009 deri 2013 në platformën PQ35. Disponohet me motorë benzin 1.2 TSI, 1.4 TSI dhe 2.0 TSI (GTI), si dhe diesel 1.6 TDI dhe 2.0 TDI. Kjo gjeneratë shënoi futjen e teknologjisë BlueMotion dhe zgjerimin e sistemeve të sigurisë. Golf 6 fitoi titullin "Makina e Vitit 2009" dhe konsiderohet njëra nga gjeneratat më të besueshme me motorë të njohur mirë dhe elektronikë të thjeshtë.',
      whyBuy: [
        'Njëra nga gjeneratat më të besueshme të Golf me motorë të njohur mirë',
        'Çmim blerjeje më i favorshëm se Golf 7 me besueshmëri të ngjashme',
        'Elektronikë më e thjeshtë dhe më e lirë për servisim se gjeneratat e reja',
        'Mbështetje e shkëlqyer shërbimi dhe disponueshmëri e lehtë e pjesëve',
        'Makina e Vitit 2009 — cilësi e konfirmuar nga industria',
      ],
      buyerProfile: 'Golf 6 është ideal për bleresit me buxhet të kufizuar që nuk duan të kompromisojnë besueshmërinë, si dhe për shoferë të rinj dhe studentë që kërkojnë një automjet ekonomik me kosto të ulëta sigurimi dhe servisimi.',
      fuelInfo:     'Konsumi mesatar: 1.6 TDI rreth 5,5–7,0 L/100 km, 1.4 TSI rreth 6,5–8,0 L/100 km, 2.0 TDI rreth 6,0–7,5 L/100 km. Variantet TDI janë më ekonomiket për distanca të gjata.',
      faq: [
        {
          q: 'A është Golf 6 automjet i besueshëm?',
          a: 'Golf 6 është përgjithësisht shumë i besueshëm — veçanërisht modelet me motorë 1.4 TSI dhe 1.6 TDI. Këta motorë janë mirë të njohur dhe lehtë servisohen. Është thelbësore të kontrollohet libri i servisit dhe rregullsia e ndërrimit të vajit.',
        },
        {
          q: 'A është më mirë të blesh Golf 6 apo Golf 7?',
          a: 'Varet nga buxheti dhe prioritetet. Golf 7 ofron teknologji moderne, aerodinamikë më të mirë dhe emetime më të ulëta, por është më i shtrenjtë. Golf 6 është më i lirë për blerje dhe servis, me elektronikë më të thjeshtë. Të dyja janë zgjedhje të shkëlqyera.',
        },
        {
          q: 'Çfarë të kontrolloni para blerjes së Golf 6?',
          a: 'Kontrolloni domosdoshmërisht: librin e servisit dhe intervalet e ndërrimit të vajit, gjendjen e transmisionit DSG (nëse është automatik), filtrin DPF tek motorët TDI, historinë e aksidenteve përmes numrit VIN dhe korrozionin.',
        },
        {
          q: 'A ka MojAutoDiler Golf 6 nga importi?',
          a: 'Po, herë pas here kemi Golf 6 nga Gjermania dhe Austria me dokumentacion të plotë të servisit. Disponueshmëria ndryshon — kontaktoni na për ofertën aktuale.',
        },
      ],
    },
  },

  tiguan: {
    displayName:  'Tiguan',
    brandDisplay: 'Volkswagen',
    dbBrand:      'Volkswagen',
    modelAliases: ['Tiguan'],
    brandSlug:    'volkswagen',
    sr: {
      metaTitle:    'Volkswagen Tiguan iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:     'Uvozni Volkswagen Tiguan sa proverenim poreklom u Srbiji. Pouzdan kompaktni SUV sa 4Motion pogonom i kompletnom dokumentacijom. Transparentna kupovina.',
      h1:           'Volkswagen Tiguan iz uvoza',
      intro:        'Volkswagen Tiguan je najprodavaniji kompaktni SUV Volkswagena i jedan od najpopularnijih uvoznih modela u Srbiji. Na MojAutoDiler platformi pronađite pažljivo odabrane uvozne Tiguan primjerke sa proverenim poreklom i dokumentovanom istorijom servisa.',
      overview:     'Volkswagen Tiguan dostupan je u dve generacije: Tiguan 1 (2008–2017) i Tiguan 2 (2016–danas). Dolazi sa benzinskim (1.4 TSI, 2.0 TSI) i dizel (2.0 TDI) motorima, te opcionalnim 4Motion pogonom na sva četiri točka. Tiguan 2 je zasnovan na MQB platformi koja donosi bolje bezbednosne ocene, naprednu elektroniku i veći prostor. Dostupan je i u produžnoj AllSpace varijanti sa 7 sedišta. Uvozni Tiguan iz Nemačke i Švajcarske posebno se traži zbog 4Motion pogona i uredno dokumentovane istorije.',
      whyBuy: [
        'Najpopularniji VW kompaktni SUV — odlična preprodajna vrednost u Srbiji',
        'Opcija 4Motion pogona na sva četiri točka za zimske i terenske uslove',
        'Prostran enterijer sa 5+2 sedišta opcijom (Tiguan AllSpace)',
        'VW Gruppe kvalitet — deli platformu i motore sa Golfom i Audijem Q3',
        'Napredni bezbednosni sistemi i visoka Euro NCAP ocena',
      ],
      buyerProfile: 'Tiguan je savršen za porodice sa decom i kućnim ljubimcima, aktivne vozače koji često putuju ili idu na planinu, te profesionalce kojima treba reprezentativan ali praktičan automobil. 4Motion verzija je posebno popularna u Srbiji zbog planinskog terena.',
      fuelInfo:     'Prosečna potrošnja: 2.0 TDI oko 6,0–7,5 L/100 km, 1.4 TSI oko 7,0–8,5 L/100 km, 2.0 TSI oko 8,0–10,0 L/100 km. 4Motion modeli troše oko 10% više od FWD verzija.',
      faq: [
        {
          q: 'Da li je Volkswagen Tiguan pouzdan SUV?',
          a: 'Volkswagen Tiguan je generalno pouzdan SUV uz redovne servisne intervale. Tiguan 2 (MQB platforma, 2016+) važi za pouzdanijeg od prethodnika. Benzinski 1.4 TSI i dizel 2.0 TDI su najzastupljeniji i najpouzdaniji izbori. 4Motion sistem je robustan uz redovan servis.',
        },
        {
          q: 'Koja je razlika između Tiguana 1 i Tiguana 2?',
          a: 'Tiguan 2 (2016+) je superiorniji: baziran na MQB platformi, ima moderniju elektroniku, bolji enterijer, naprednije bezbednosne sisteme i veći prtljažnik. Dostupan je i u produžnoj AllSpace verziji sa 7 sedišta. Tiguan 1 je jeftinija i jednostavnija opcija.',
        },
        {
          q: 'Da li je 4Motion pogon neophodan na Tiguanu?',
          a: '4Motion pogon preporučujemo za vozače koji idu u planinu, na terenska putovanja ili žive na lošijim putevima. Za čisto gradsku vožnju FWD (prednji pogon) verzija je dovoljna i jeftinija za nabavku i održavanje.',
        },
        {
          q: 'Da li MojAutoDiler ima Tiguan sa 4Motion pogonom?',
          a: 'Da, redovno imamo Tiguan 4Motion primjerke uvezene iz Nemačke i Švajcarske. Svi detalji o pogonu, opremi i poreklu jasno su navedeni u svakom oglasu.',
        },
      ],
    },
    sq: {
      metaTitle:    'Volkswagen Tiguan nga importi në Serbi | Moj Auto Diler',
      metaDesc:     'Volkswagen Tiguan nga importi me origjinë të verifikuar në Serbi. SUV kompakt i besueshëm me tërheqje 4Motion dhe dokumentacion të plotë. Blerje transparente.',
      h1:           'Volkswagen Tiguan nga importi',
      intro:        'Volkswagen Tiguan është SUV kompakt më i shitur i Volkswagen dhe njëri nga modelet e importit më të njohur në Serbi. Gjeni Tiguan nga importi me origjinë të verifikuar dhe histori të dokumentuar servisi.',
      overview:     'Volkswagen Tiguan disponohet në dy gjenerata: Tiguan 1 (2008–2017) dhe Tiguan 2 (2016–sot). Disponohet me motorë benzin (1.4 TSI, 2.0 TSI) dhe diesel (2.0 TDI), me opsionin e tërheqjes 4Motion me katër rrota. Tiguan 2 është bazuar në platformën MQB me siguri më të mirë, elektronikë të avancuar dhe hapësirë më të madhe. Disponohet edhe në version të zgjatur AllSpace me 7 ulëse.',
      whyBuy: [
        'SUV kompakt më i njohur VW — vlerë e shkëlqyer rishitjeje',
        'Opsioni i tërheqjes 4Motion me katër rrota për kushte dimri dhe terren',
        'Interior i bollshëm me opsion 5+2 ulëse (Tiguan AllSpace)',
        'Cilësi VW Group — ndan platformën dhe motorët me Golf dhe Audi Q3',
        'Sisteme të avancuara sigurie dhe vlerësim i lartë Euro NCAP',
      ],
      buyerProfile: 'Tiguan është i përsosur për familje me fëmijë dhe kafshë shtëpiake, shoferë aktivë që udhëtojnë shpesh ose shkojnë në mal, dhe profesionistë që kanë nevojë për një automjet përfaqësues por praktik.',
      fuelInfo:     'Konsumi mesatar: 2.0 TDI rreth 6,0–7,5 L/100 km, 1.4 TSI rreth 7,0–8,5 L/100 km, 2.0 TSI rreth 8,0–10,0 L/100 km. Modelet 4Motion konsumojnë rreth 10% më shumë se variantet FWD.',
      faq: [
        {
          q: 'A është Volkswagen Tiguan SUV i besueshëm?',
          a: 'Volkswagen Tiguan është përgjithësisht SUV i besueshëm me servisim të rregullt. Tiguan 2 (platforma MQB, 2016+) konsiderohet më i besueshëm se paraardhësi. Benzini 1.4 TSI dhe diesel 2.0 TDI janë zgjedhjet më të përfaqësuara dhe më të besueshme.',
        },
        {
          q: 'Cila është diferenca midis Tiguan 1 dhe Tiguan 2?',
          a: 'Tiguan 2 (2016+) është superior: bazuar në platformën MQB, ka elektronikë moderne, interior më të mirë, sisteme sigurie të avancuara dhe bagazh më të madh. Disponohet edhe në version të zgjatur AllSpace me 7 ulëse. Tiguan 1 është opsion më i lirë dhe më i thjeshtë.',
        },
        {
          q: 'A është tërheqja 4Motion e nevojshme në Tiguan?',
          a: 'Tërheqjen 4Motion e rekomandojmë për shoferë që shkojnë në mal, udhëtime në terren ose jetojnë në rrugë të keqe. Për ngasje tërësisht urbane, versioni FWD (tërheqje para) është i mjaftueshëm dhe më i lirë.',
        },
        {
          q: 'A ka MojAutoDiler Tiguan me tërheqje 4Motion?',
          a: 'Po, rregullisht kemi Tiguan 4Motion nga Gjermania dhe Zvicra. Të gjitha detajet rreth tërheqjes, pajisjeve dhe origjinës janë qartë të shënuara në çdo shpallje.',
        },
      ],
    },
  },

  octavia: {
    displayName:  'Octavia',
    brandDisplay: 'Škoda',
    dbBrand:      'Škoda',
    modelAliases: ['Octavia'],
    brandSlug:    'skoda',
    sr: {
      metaTitle:    'Škoda Octavia iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:     'Uvozna Škoda Octavia sa proverenim poreklom u Srbiji. Prostrana i ekonomična limuzina ili karavan na VW platformi sa kompletnom dokumentacijom.',
      h1:           'Škoda Octavia iz uvoza',
      intro:        'Škoda Octavia je sinonim za vrednost — prostran, pouzdan i ekonomičan automobil koji koristi VW Gruppe motore i platforme po nižoj ceni. Na MojAutoDiler platformi pronađite uvozne Octavia primjerke sa proverenim poreklom i dokumentovanom istorijom.',
      overview:     'Škoda Octavia dostupna je u tri generacije: Mk2 (2004–2013), Mk3 (2013–2020) i Mk4 (2020–danas). Deli MQB platformu i motore (1.0 TSI, 1.4 TSI, 2.0 TSI, 1.6 TDI, 2.0 TDI) sa Volkswagen Golfom i Audijem A3, ali po znatno nižoj ceni. Octavia nudi izuzetno prostran enterijer i jedan od najvećih prtljažnika u klasi (590L kod karavana). Dostupna je kao limuzina ili karavan, sa ili bez 4×4 pogona. Uvozna Octavia iz Češke i Nemačke posebno se traži zbog dokumentovane istorije i VW Gruppe kvaliteta.',
      whyBuy: [
        'VW Gruppe kvalitet i motori po Škoda ceni — odličan odnos vrednosti i cene',
        'Jedan od najvećih prtljažnika u klasi (590L kod karavana)',
        'Niski troškovi servisa zahvaljujući deljenim delovima sa VW i Audijem',
        'Dostupna u limuzina i karavan karoseriji sa i bez 4×4 pogona',
        'Pouzdana i dobro zastupljena na srpskom tržištu delova i servisa',
      ],
      buyerProfile: 'Octavia je idealna za porodice kojima treba prostran i ekonomičan auto, poslovne vozače koji rade duge relacije, i kupce koji žele VW Gruppe kvalitet uz manji budžet. Karavan verzija je posebno popularna u Srbiji zbog praktičnosti.',
      fuelInfo:     'Prosečna potrošnja: 1.6 TDI oko 5,0–6,5 L/100 km, 1.4 TSI oko 6,5–8,0 L/100 km, 2.0 TDI oko 5,5–7,0 L/100 km. Karavan verzija ima gotovo identičnu potrošnju kao limuzina.',
      faq: [
        {
          q: 'Da li je Škoda Octavia pouzdana?',
          a: 'Škoda Octavia je generalno veoma pouzdana zahvaljujući VW Gruppe motorima i platformi. Mk3 generacija (2013–2020) važi za posebno pouzdanu. Benzinski 1.4 TSI i dizel 1.6 TDI su najzastupljeniji i najpouzdaniji motori.',
        },
        {
          q: 'Da li je bolje kupiti Octavia limuzinu ili karavan?',
          a: 'Zavisi od potreba. Karavan nudi znatno veći prtljažnik (590L) — idealan za porodice i dulja putovanja. Limuzina je nešto sportskijeg izgleda. Cene su slične, a pouzdanost identična.',
        },
        {
          q: 'Koja je razlika između Škoda Octavia i VW Golf?',
          a: 'Octavia deli motore i platformu sa Golfom, ali nudi znatno više prostora i veći prtljažnik po sličnoj ili nižoj ceni. Golf ima sportskiji karakter i bolju preprodajnu vrednost. Octavia je pragmatičniji izbor za porodice.',
        },
        {
          q: 'Da li MojAutoDiler ima Škoda Octavia iz uvoza?',
          a: 'Da, redovno imamo uvozne Octavia primjerke iz Češke i Nemačke. Svi detalji o poreklu, generaciji i opremi vidljivi su u svakom oglasu.',
        },
      ],
    },
    sq: {
      metaTitle:    'Škoda Octavia nga importi në Serbi | Moj Auto Diler',
      metaDesc:     'Škoda Octavia nga importi me origjinë të verifikuar në Serbi. Sedan/kombi i bollshëm dhe ekonomik në platformën VW me dokumentacion të plotë.',
      h1:           'Škoda Octavia nga importi',
      intro:        'Škoda Octavia është sinonim i vlerës — automjet i bollshëm, i besueshëm dhe ekonomik që përdor motorët dhe platformat e VW Group. Gjeni Octavia nga importi me origjinë të verifikuar dhe histori të dokumentuar.',
      overview:     'Škoda Octavia disponohet në tre gjenerata: Mk2 (2004–2013), Mk3 (2013–2020) dhe Mk4 (2020–sot). Ndan platformën MQB dhe motorët (1.0 TSI, 1.4 TSI, 2.0 TSI, 1.6 TDI, 2.0 TDI) me Volkswagen Golf dhe Audi A3, por me çmim dukshëm më të ulët. Octavia ofron interior dhe bagazh jashtëzakonisht të bollshëm — ndër më të mëdhenjtë në klasë (590L tek kombiu). Disponohet si sedan ose kombi, me dhe pa tërheqje 4×4.',
      whyBuy: [
        'Cilësi dhe motorë VW Group me çmim Škoda — raport i shkëlqyer vlerë-çmim',
        'Një nga bagazhet më të mëdha në klasë (590L tek kombiu)',
        'Kosto të ulëta servisimi falë pjesëve të ndara me VW dhe Audi',
        'Disponohet në karrocerinë sedan dhe kombi me dhe pa tërheqje 4×4',
        'E besueshme dhe e mirë-përfaqësuar në tregun e pjesëve dhe servisimit',
      ],
      buyerProfile: 'Octavia është ideale për familje që kanë nevojë për hapësirë dhe ekonomi, shoferë biznesi që bëjnë distanca të gjata, dhe bleresit që duan cilësi VW Group me buxhet më të vogël. Versioni kombi është veçanërisht i njohur.',
      fuelInfo:     'Konsumi mesatar: 1.6 TDI rreth 5,0–6,5 L/100 km, 1.4 TSI rreth 6,5–8,0 L/100 km, 2.0 TDI rreth 5,5–7,0 L/100 km. Versioni kombi ka konsum pothuajse identik me sedanin.',
      faq: [
        {
          q: 'A është Škoda Octavia e besueshme?',
          a: 'Škoda Octavia është përgjithësisht shumë e besueshme falë motorëve dhe platformës VW Group. Gjenerata Mk3 (2013–2020) konsiderohet veçanërisht e besueshme. Motorët benzin 1.4 TSI dhe diesel 1.6 TDI janë më të përfaqësuarit dhe më të besueshëm.',
        },
        {
          q: 'A është më mirë të blesh Octavia sedan apo kombi?',
          a: 'Varet nga nevojat. Kombiu ofron bagazh dukshëm më të madh (590L) — ideal për familje dhe udhëtime të gjata. Sedani ka pamje pak më sportive. Çmimet janë të ngjashme dhe besueshmëria identike.',
        },
        {
          q: 'Cila është diferenca midis Škoda Octavia dhe VW Golf?',
          a: 'Octavia ndan motorët dhe platformën me Golf, por ofron shumë më tepër hapësirë dhe bagazh më të madh me çmim të ngjashëm ose më të ulët. Golf ka karakter sportiv dhe vlerë rishitjeje pak më të lartë. Octavia është zgjedhja pragmatike për familjet.',
        },
        {
          q: 'A ka MojAutoDiler Škoda Octavia nga importi?',
          a: 'Po, rregullisht kemi Octavia nga importi nga Republika Çeke dhe Gjermania. Të gjitha detajet rreth origjinës, gjeneratës dhe pajisjeve janë të dukshme në çdo shpallje.',
        },
      ],
    },
  },

  'audi-a4': {
    displayName:  'A4',
    brandDisplay: 'Audi',
    dbBrand:      'Audi',
    modelAliases: ['A4'],
    brandSlug:    'audi',
    sr: {
      metaTitle:    'Audi A4 iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:     'Uvozni Audi A4 sa proverenim poreklom u Srbiji. Premium sedan sa quattro pogonom, naprednom tehnologijom i kompletnom dokumentacijom. Transparentna kupovina.',
      h1:           'Audi A4 iz uvoza',
      intro:        'Audi A4 je ikona premium segmenta i jedan od najprodavanijih luksuznih sedana u Srbiji. Na MojAutoDiler platformi pronađite uvozne Audi A4 primjerke sa proverenim poreklom, kompletnom servisnom dokumentacijom i transparentnom kupovinom.',
      overview:     'Audi A4 dostupan je u više generacija: B6 (2000–2004), B7 (2004–2008), B8 (2008–2016) i B9 (2016–danas). Naša ponuda fokusira se na B8 i B9 generacije zbog optimalnog balansa cene, modernosti i pouzdanosti. A4 dolazi sa benzinskim (1.8 TFSI, 2.0 TFSI) i dizel (2.0 TDI) motorima, s opcionalnim quattro pogonom na sva četiri točka. Audi A4 iz Nemačke i Austrije posebno je tražen zbog dokumentovane Audi Service istorije i niže kilometraže.',
      whyBuy: [
        'Premium sedan sa izvanrednim finišom enterijera i Audi Virtual Cockpitom',
        'Opcija quattro pogona za maksimalnu sigurnost i kontrolu u svim uslovima',
        'Ekonomični TDI dizel motori sa niskom potrošnjom za duže relacije',
        'Audi A4 drži odličnu vrednost pri preprodaji u Srbiji',
        'MMI infotejnment sistem i napredni bezbednosni sistemi standardno',
      ],
      buyerProfile: 'Audi A4 je idealan za profesionalce i menadžere koji žele reprezentativan automobil sa premium kvalitetom i quattro bezbednošću. Posebno je popularan među poslovnim kupcima koji kombinuju udobnost sa sportskim karakterom.',
      fuelInfo:     'Prosečna potrošnja: 2.0 TDI oko 5,0–6,5 L/100 km, 1.8 TFSI oko 7,0–8,5 L/100 km, 2.0 TFSI oko 7,5–9,0 L/100 km. Quattro pogon uvodi oko 10–15% višu potrošnju od FWD verzija.',
      faq: [
        {
          q: 'Da li je Audi A4 pouzdan automobil?',
          a: 'Audi A4 B8 i B9 generacije su generalno pouzdani uz redovan servis. Benzinski 2.0 TFSI i dizel 2.0 TDI su najzastupljeniji motori. Ključno je proveriti kompletnu Audi Service istoriju. Quattro sistem je robustan ali zahteva kvalitetno ulje i redovne preglede.',
        },
        {
          q: 'Koja je razlika između Audi A4 B8 i B9?',
          a: 'A4 B9 (2016+) je nadmoćniji: digitalni kokpit, MLB platforma, bolja aerodinamika i napredni bezbednosni sistemi. B8 (2008–2016) je jeftinija opcija sa poznatom pouzdanošću. Za dugoročnu investiciju preporučujemo B9 generaciju.',
        },
        {
          q: 'Da li je quattro pogon neophodan na A4?',
          a: 'Quattro preporučujemo za planinsku i zimsku vožnju ili intenzivniju upotrebu. Za pretežno gradsku vožnju FWD (prednji pogon) modeli su jeftiniji za nabavku i imaju nižu potrošnju. Quattro dodaje vrednost pri preprodaji.',
        },
        {
          q: 'Da li MojAutoDiler ima Audi A4 iz Nemačke?',
          a: 'Da, redovno imamo A4 primjerke uvezene iz Nemačke i Austrije sa originalnom Audi Service dokumentacijom. Sve specifikacije i istorija vidljive su u detaljima svakog oglasa.',
        },
      ],
    },
    sq: {
      metaTitle:    'Audi A4 nga importi në Serbi | Moj Auto Diler',
      metaDesc:     'Audi A4 nga importi me origjinë të verifikuar në Serbi. Sedan premium me tërheqje quattro, teknologji të avancuar dhe dokumentacion të plotë. Blerje transparente.',
      h1:           'Audi A4 nga importi',
      intro:        'Audi A4 është ikona e segmentit premium dhe njëri nga sedanët luksoz më të shitur në Serbi. Gjeni Audi A4 nga importi me origjinë të verifikuar, dokumentacion të plotë servisi dhe blerje transparente pa presion.',
      overview:     'Audi A4 disponohet në disa gjenerata: B6 (2000–2004), B7 (2004–2008), B8 (2008–2016) dhe B9 (2016–sot). Oferta jonë fokusohet tek gjeneratat B8 dhe B9 për balancën optimale çmim-modernitet-besueshmëri. A4 vjen me motorë benzin (1.8 TFSI, 2.0 TFSI) dhe diesel (2.0 TDI), me opsionin quattro me katër rrota. Audi A4 nga Gjermania dhe Austria është veçanërisht i kërkuar për historinë Audi Service dhe kilometrazhin e ulët.',
      whyBuy: [
        'Sedan premium me finisazh të jashtëzakonshëm dhe Audi Virtual Cockpit',
        'Opsioni quattro për siguri dhe kontroll maksimal në të gjitha kushtet',
        'Motorë diesel TDI ekonomikë me konsum të ulët për distanca të gjata',
        'Audi A4 ruan vlerë të shkëlqyer rishitjeje në Serbi',
        'Sistemi MMI infotejnment dhe sisteme të avancuara sigurie si standard',
      ],
      buyerProfile: 'Audi A4 është ideal për profesionistë dhe menaxherë që duan një automjet përfaqësues me cilësi premium dhe sigurinë quattro. Veçanërisht i njohur mes bleresve të biznesit që kombinojnë rehatinë me karakterin sportiv.',
      fuelInfo:     'Konsumi mesatar: 2.0 TDI rreth 5,0–6,5 L/100 km, 1.8 TFSI rreth 7,0–8,5 L/100 km, 2.0 TFSI rreth 7,5–9,0 L/100 km. Quattro shton rreth 10–15% konsum më shumë se variantet FWD.',
      faq: [
        {
          q: 'A është Audi A4 automjet i besueshëm?',
          a: 'Gjeneratat Audi A4 B8 dhe B9 janë përgjithësisht të besueshme me servisim të rregullt. Motorët benzin 2.0 TFSI dhe diesel 2.0 TDI janë më të përfaqësuarit. Është thelbësore të kontrollohet historia e plotë Audi Service. Sistemi quattro është i qëndrueshëm por kërkon vaj cilësor.',
        },
        {
          q: 'Cila është diferenca midis Audi A4 B8 dhe B9?',
          a: 'A4 B9 (2016+) është superior: kokpit digjital, platforma MLB, aerodinamikë më e mirë dhe sisteme sigurie të avancuara. B8 (2008–2016) është opsion më i lirë me besueshmëri të provuar. Për investim afatgjatë rekomandojmë B9.',
        },
        {
          q: 'A është tërheqja quattro e nevojshme në A4?',
          a: 'Quattro e rekomandojmë për ngasje malore e dimri ose përdorim intensiv. Për ngasje kryesisht urbane, modelet FWD janë më të lira dhe kanë konsum më të ulët. Quattro shton vlerë rishitjeje.',
        },
        {
          q: 'A ka MojAutoDiler Audi A4 nga Gjermania?',
          a: 'Po, rregullisht kemi A4 nga Gjermania dhe Austria me dokumentacion origjinal Audi Service. Të gjitha specifikimet dhe historia janë të dukshme në detajet e çdo shpalljeje.',
        },
      ],
    },
  },

  'bmw-x3': {
    displayName:  'X3',
    brandDisplay: 'BMW',
    dbBrand:      'BMW',
    modelAliases: ['X3'],
    brandSlug:    'bmw',
    sr: {
      metaTitle:    'BMW X3 iz uvoza u Srbiji | Moj Auto Diler',
      metaDesc:     'Uvozni BMW X3 sa proverenim poreklom u Srbiji. Premium SUV sa xDrive pogonom, sportskim karakterom i kompletnom BMW dokumentacijom. Transparentna kupovina.',
      h1:           'BMW X3 iz uvoza',
      intro:        'BMW X3 je premium kompaktni SUV koji spaja sportsku dinamiku BMW-a sa praktičnošću SUV karoserije. Na MojAutoDiler platformi pronađite uvozne BMW X3 primjerke sa proverenim poreklom, originalnom BMW dokumentacijom i transparentnom kupovinom.',
      overview:     'BMW X3 dostupan je u tri generacije: E83 (2003–2010), F25 (2010–2017) i G01 (2017–danas). Naša ponuda fokusira se na F25 i G01 generacije — popularne zbog optimalnog balansa cene, performansi i modernosti. Dolazi sa benzinskim (2.0i, 3.0i, M40i) i dizel (2.0d, 3.0d) motorima, gotovo uvek sa xDrive pogonom na sva četiri točka. BMW X3 iz Nemačke i Švajcarske posebno je tražen zbog BMW Service History i konzistentno niže kilometraže.',
      whyBuy: [
        'Sportski BMW karakter u praktičnom SUV formatu za svakodnevnu upotrebu',
        'xDrive pogon na sva četiri točka za izvanrednu kontrolu u svim uslovima',
        'Premium enterijer sa iDrive sistemom i digitalnim instrumentima',
        'BMW X3 drži odličnu vrednost pri preprodaji u Srbiji',
        'Napredni bezbednosni sistemi i 5 zvezdica Euro NCAP ocena',
      ],
      buyerProfile: 'BMW X3 je idealan za profesionalce koji žele sportski karakter kombinovan sa SUV praktičnošću, za aktivne porodice i vozače koji preferiraju premium brend uz svakodnevnu upotrebljivost. xDrive verzija je popularna u Srbiji zbog hladnih zima i planinskih puteva.',
      fuelInfo:     'Prosečna potrošnja: 2.0d (xDrive20d) oko 6,0–7,5 L/100 km, 3.0d (xDrive30d) oko 7,0–8,5 L/100 km, 2.0i (xDrive20i) oko 8,0–10,0 L/100 km. xDrive pogon uvodi oko 10–15% višu potrošnju od 2WD ekvivalenta.',
      faq: [
        {
          q: 'Da li je BMW X3 pouzdan SUV?',
          a: 'BMW X3 F25 i G01 generacije su generalno pouzdani uz redovan BMW servis. Dizel modeli xDrive20d i xDrive30d važe za posebno robustne. Ključno je proveriti BMW servisnu istoriju i stanje xDrive sistema. Preporučujemo profesionalnu dijagnostiku pre kupovine.',
        },
        {
          q: 'Koja je razlika između BMW X3 F25 i G01?',
          a: 'X3 G01 (2017+) nudi moderniji dizajn, iDrive 6.0 infotejnment, bolji enterijer i naprednije bezbednosne sisteme. F25 je jeftinija opcija sa dobro poznatom mehanikom. Za dugoročnu investiciju preporučujemo G01 generaciju.',
        },
        {
          q: 'Da li je BMW X3 ekonomičan za održavanje?',
          a: 'BMW X3 ima nešto više troškove održavanja od proseka, što je tipično za premium segment. Redovni servis je obavezan na svakih 10.000–15.000 km. Dizel modeli su generalno ekonomičniji za duge relacije. Preporučujemo proveru stanja svih sistema pre kupovine.',
        },
        {
          q: 'Da li MojAutoDiler ima BMW X3 iz Nemačke?',
          a: 'Da, redovno imamo X3 primjerke uvezene iz Nemačke i Švajcarske sa kompletnom BMW Service dokumentacijom. Svi detalji o xDrive sistemu, opremi i poreklu vidljivi su u svakom oglasu.',
        },
      ],
    },
    sq: {
      metaTitle:    'BMW X3 nga importi në Serbi | Moj Auto Diler',
      metaDesc:     'BMW X3 nga importi me origjinë të verifikuar në Serbi. SUV premium me tërheqje xDrive, karakter sportiv dhe dokumentacion BMW origjinal. Blerje transparente.',
      h1:           'BMW X3 nga importi',
      intro:        'BMW X3 është SUV kompakt premium që kombinon dinamikën sportive të BMW me praktikitetin e karrocerisë SUV. Gjeni BMW X3 nga importi me origjinë të verifikuar, dokumentacion origjinal BMW dhe blerje transparente pa presion.',
      overview:     'BMW X3 disponohet në tre gjenerata: E83 (2003–2010), F25 (2010–2017) dhe G01 (2017–sot). Oferta jonë fokusohet tek gjeneratat F25 dhe G01 — të njohura për balancën optimale çmim-performancë-modernitet. Disponohet me motorë benzin (2.0i, 3.0i, M40i) dhe diesel (2.0d, 3.0d), pothuajse gjithmonë me tërheqje xDrive me katër rrota. BMW X3 nga Gjermania dhe Zvicra është veçanërisht i kërkuar për BMW Service History dhe kilometrazhin e ulët.',
      whyBuy: [
        'Karakter sportiv BMW në formatin praktik SUV për përdorim të përditshëm',
        'Tërheqja xDrive me katër rrota për kontroll të jashtëzakonshëm në të gjitha kushtet',
        'Interior premium me sistemin iDrive dhe instrumente digjitale',
        'BMW X3 ruan vlerë të shkëlqyer rishitjeje në Serbi',
        'Sisteme të avancuara sigurie dhe vlerësim 5 yje Euro NCAP',
      ],
      buyerProfile: 'BMW X3 është ideal për profesionistë që duan karakter sportiv kombinuar me praktikitetin SUV, familje aktive dhe shoferë që preferojnë brendin premium me përdorshmëri të përditshme. Versioni xDrive është i njohur në Serbi për dimrat e ftohtë.',
      fuelInfo:     'Konsumi mesatar: 2.0d (xDrive20d) rreth 6,0–7,5 L/100 km, 3.0d (xDrive30d) rreth 7,0–8,5 L/100 km, 2.0i (xDrive20i) rreth 8,0–10,0 L/100 km. xDrive shton rreth 10–15% konsum më shumë se ekuivalenti 2WD.',
      faq: [
        {
          q: 'A është BMW X3 SUV i besueshëm?',
          a: 'Gjeneratat BMW X3 F25 dhe G01 janë përgjithësisht të besueshme me servisim të rregullt BMW. Modelet diesel xDrive20d dhe xDrive30d konsiderohen veçanërisht të qëndrueshme. Është thelbësore të kontrollohet historia BMW e servisit dhe gjendja e sistemit xDrive.',
        },
        {
          q: 'Cila është diferenca midis BMW X3 F25 dhe G01?',
          a: 'X3 G01 (2017+) ofron dizajn modern, infotejnment iDrive 6.0, interior më të mirë dhe sisteme sigurie të avancuara. F25 është opsion më i lirë me mekanikë mirë të njohur. Për investim afatgjatë rekomandojmë gjeneratën G01.',
        },
        {
          q: 'A është BMW X3 ekonomik për mirëmbajtje?',
          a: 'BMW X3 ka kosto mirëmbajtjeje pak mbi mesataren, tipike për segmentin premium. Shërbimi i rregullt është i detyrueshëm çdo 10.000–15.000 km. Modelet diesel janë përgjithësisht më ekonomikë për distanca të gjata.',
        },
        {
          q: 'A ka MojAutoDiler BMW X3 nga Gjermania?',
          a: 'Po, rregullisht kemi X3 nga Gjermania dhe Zvicra me dokumentacion të plotë BMW Service. Të gjitha detajet rreth sistemit xDrive, pajisjeve dhe origjinës janë të dukshme në çdo shpallje.',
        },
      ],
    },
  },
};

export const MODEL_SLUGS = Object.keys(MODELS) as ModelSlug[];

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return MODEL_SLUGS.flatMap((slug) => [
    { locale: 'sr', slug },
    { locale: 'sq', slug },
  ]);
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params;
  const def = MODELS[slug as ModelSlug];
  if (!def || !isValidLocale(locale)) return {};

  const content  = locale === 'sq' ? def.sq : def.sr;
  const canonical = `/${locale}/model/${slug}`;

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
        sr: `/sr/model/${slug}`,
        sq: `/sq/model/${slug}`,
      },
    },
    openGraph: {
      type:        'website',
      title:       content.metaTitle,
      description: content.metaDesc,
      url:         `${SITE}${canonical}`,
      siteName:    'Moj Auto Diler',
      images: [
        { url: `/og/model-${slug}.jpg`, width: 1200, height: 630, alt: content.metaTitle },
        { url: '/og-image.jpg',         width: 1200, height: 630, alt: 'Moj Auto Diler' },
      ],
    },
    twitter: {
      card:        'summary_large_image',
      title:       content.metaTitle,
      description: content.metaDesc,
      images:      [`${SITE}/og/model-${slug}.jpg`],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ModelPage(
  { params }: { readonly params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const def = MODELS[slug as ModelSlug];
  if (!def) notFound();

  const content  = locale === 'sq' ? def.sq : def.sr;
  const t        = getTranslations(locale);
  const vehicles = await getVehiclesByModel(def.dbBrand, def.modelAliases);
  const pageUrl  = `${SITE}/${locale}/model/${slug}`;
  const isSq     = locale === 'sq';

  const breadcrumbs = [
    { name: isSq ? 'Kryefaqja' : 'Početna',   url: `${SITE}/${locale}` },
    { name: isSq ? 'Automjetet' : 'Vozila',    url: `${SITE}/${locale}/inventory` },
    { name: def.brandDisplay,                   url: `${SITE}/${locale}/cars/${def.brandSlug}` },
    { name: def.displayName,                    url: pageUrl },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ModelSiloJsonLd
        modelName={def.displayName}
        brandName={def.brandDisplay}
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
            <Link href={`/${locale}/cars/${def.brandSlug}`} className="hover:text-(--color-text) transition-colors">
              {def.brandDisplay}
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
                  {def.brandDisplay} {def.displayName} · {isSq ? 'Import' : 'Uvoz'}
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
                        ? `${vehicles.length} ${def.brandDisplay} ${def.displayName} ${vehicles.length === 1 ? 'automjet' : 'automjete'} në ofertë`
                        : `${vehicles.length} ${def.brandDisplay} ${def.displayName} ${vehicles.length === 1 ? 'vozilo' : 'vozila'} u ponudi`
                      : isSq
                        ? `${def.brandDisplay} ${def.displayName} automjetet`
                        : `${def.brandDisplay} ${def.displayName} vozila`}
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
                    ? `Aktualisht nuk ka ${def.brandDisplay} ${def.displayName} në ofertë. Kontaktoni na për informacion.`
                    : `Trenutno nema ${def.brandDisplay} ${def.displayName} vozila u ponudi. Kontaktirajte nas za više informacija.`}
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

          {/* ── Model overview ─────────────────────────────────────────────── */}
          <section>
            <Reveal>
              <div className="rounded-3xl border border-(--color-border) bg-white p-6 sm:p-8">
                <div className="divider-gold mb-5" />
                <h2
                  className="mb-4 text-xl font-black text-(--color-text) sm:text-2xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isSq
                    ? `Rreth modelit ${def.brandDisplay} ${def.displayName}`
                    : `O modelu ${def.brandDisplay} ${def.displayName}`}
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
                  ? `Pse të blini ${def.brandDisplay} ${def.displayName} në MojAutoDiler`
                  : `Zašto kupiti ${def.brandDisplay} ${def.displayName} na MojAutoDiler`}
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

          {/* ── Buyer profile + fuel info ──────────────────────────────────── */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal>
                <div className="flex flex-col gap-4 rounded-3xl border border-(--color-border) bg-white p-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent-soft)">
                      <User size={16} className="text-(--accent-dark)" />
                    </div>
                    <h3 className="text-sm font-black text-(--color-text) uppercase tracking-wide">
                      {isSq ? 'Kush e zgjedh këtë model' : 'Ko bira ovaj model'}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-(--color-text-muted)">{content.buyerProfile}</p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="flex flex-col gap-4 rounded-3xl border border-(--color-border) bg-white p-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent-soft)">
                      <Fuel size={16} className="text-(--accent-dark)" />
                    </div>
                    <h3 className="text-sm font-black text-(--color-text) uppercase tracking-wide">
                      {isSq ? 'Konsumi tipik i karburantit' : 'Tipična potrošnja goriva'}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-(--color-text-muted)">{content.fuelInfo}</p>
                </div>
              </Reveal>
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
                  ? `Pyetjet e shpeshta — ${def.brandDisplay} ${def.displayName}`
                  : `Česta pitanja — ${def.brandDisplay} ${def.displayName}`}
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

          {/* ── Internal link to brand page ────────────────────────────────── */}
          <Reveal>
            <section className="rounded-3xl border border-(--color-border) bg-white p-6 sm:p-8">
              <div className="divider-gold mb-5" />
              <h2
                className="mb-3 text-lg font-black text-(--color-text) sm:text-xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isSq
                  ? `Shiko të gjitha automjetet ${def.brandDisplay}`
                  : `Sva vozila ${def.brandDisplay}`}
              </h2>
              <p className="text-sm leading-7 text-(--color-text-muted)">
                {isSq
                  ? `Interesoheni edhe për modelet e tjerë ${def.brandDisplay}? Shikoni ofertën e plotë.`
                  : `Interesuje vas i ostatak ponude ${def.brandDisplay}? Pogledajte sva dostupna vozila.`}
              </p>
              <Link
                href={`/${locale}/cars/${def.brandSlug}`}
                className="btn-outline mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
              >
                {isSq ? `Sva ${def.brandDisplay} vozila` : `Sva ${def.brandDisplay} vozila`}
                <ArrowRight size={15} />
              </Link>
            </section>
          </Reveal>

          {/* ── CTA ────────────────────────────────────────────────────────── */}
          <Reveal>
            <section className="rounded-3xl border border-(--accent-border) bg-(--accent-soft) p-6 sm:p-8 text-center">
              <h2
                className="text-xl font-black text-(--color-text) sm:text-2xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isSq
                  ? `Kërkoni ${def.brandDisplay} ${def.displayName}?`
                  : `Tražite ${def.brandDisplay} ${def.displayName}?`}
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
