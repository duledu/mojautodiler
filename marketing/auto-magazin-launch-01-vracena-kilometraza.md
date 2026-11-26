# Promotivni paket za pokretanje Auto magazina: Prvi članak

**Članak:** Vraćena kilometraža: Kako prepoznati prevaru i šta uraditi?  
**URL:** `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru`  
**Status:** Lokalna priprema (čeka odobrenje za objavu)  
**Jezik:** Srpski (latinica, ekavica)

---

## 1. UTM matrica za praćenje kampanja

Svi linkovi ispod usklađeni su sa postojećim `lib/utm.ts` sistemom na sajtu MojAutoDiler (`captureUtm()` automatski čuva `utm_source`, `utm_medium`, `utm_campaign` i `utm_content` u sesiji i povezuje ih sa upitima za vozila).

| Kanal / Pozicija | Kompletan URL sa UTM parametrima |
| --- | --- |
| **Facebook objava (organski feed)** | `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=facebook&utm_medium=social&utm_campaign=auto_magazin_launch_01&utm_content=fb_feed_post` |
| **Facebook komentar (prvi komentar)** | `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=facebook&utm_medium=social&utm_campaign=auto_magazin_launch_01&utm_content=fb_first_comment` |
| **Facebook Story (Link sticker)** | `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=facebook&utm_medium=story&utm_campaign=auto_magazin_launch_01&utm_content=fb_story_frame3` |
| **Instagram Bio link** | `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=instagram&utm_medium=social&utm_campaign=auto_magazin_launch_01&utm_content=ig_bio_link` |
| **Instagram Story (Link sticker)** | `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=instagram&utm_medium=story&utm_campaign=auto_magazin_launch_01&utm_content=ig_story_frame3` |
| **Auto magazin početna (opšta promocija)** | `https://www.mojautodiler.com/sr/blog?utm_source=instagram&utm_medium=social&utm_campaign=auto_magazin_launch_01&utm_content=ig_magazin_hub` |

> **Napomena za carVertical linkove na društvenim mrežama:** Ako na Instagramu (bio ili Story) delite direktan carVertical partnerski link umesto linka ka članku, koristite isključivo odobreni Instagram partnerski link (`sub2=instagram`): `https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=instagram`. Za Facebook ne postoje odvojeni `sub2=facebook` parametri, pa Facebook objave uvek vode na članak na MojAutoDiler sajtu (gde se nalazi odobreni `sub2=blog` CTA).

---

## 2. Facebook objava

**Format:** Slika (1200×630 ili 1080×1350) + tekst objave; link staviti i u objavu ili u prvi komentar radi boljeg organskog dosega.

**Tekst objave:**

Dizel star deset godina, uvezen iz inostranstva, a na tabli piše „pravih 178.000 km”. Zvuči poznato?

Vraćena kilometraža je i dalje jedna od najskupljih zamki pri kupovini polovnog automobila u Srbiji. Kada auto zapravo ima 320.000 km umesto prikazanih 170.000 km, problem nije samo broj na ekranu. Problem su dizne, DPF, plivajući zamajac i automatski menjač koji vrlo brzo dolaze na naplatu.

Pokrenuli smo **Auto magazin** na MojAutoDiler.com, a u prvom vodiču bez ulepšavanja objašnjavamo:

- Kako se danas manipuliše kilometražom (EEPROM, CAN blokatori) i zašto prevaranti retko uspeju da „očiste” sve module.
- Kojih 5 fizičkih detalja u kabini odmah odaju da auto ima mnogo više kilometara nego što piše.
- Gde majstor na dijagnostici traži realnu kilometražu (ECU radni sati, TCU menjača, pepeo u DPF-u, ključ).
- Šta tačno kaže zakon u Srbiji (član 208. Krivičnog zakonika i Zakon o zaštiti potrošača) i kojim redosledom reagovati ako ste već prevareni.

Pročitajte kompletan vodič pre nego što ostavite kaparu za sledeći automobil:
https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=facebook&utm_medium=social&utm_campaign=auto_magazin_launch_01&utm_content=fb_feed_post

Da li ste nekada proverili auto i otkrili da mu je vraćena kilometraža? Pišite u komentarima kolika je bila razlika.

---

## 3. Instagram objava (Feed / Carousel 4:5)

**Format:** 5-slajd carousel (1080×1350 px), idealan za čuvanje (Saves) i deljenje (Shares).

### Predlog teksta po slajdovima (Carousel)

- **Slajd 1 (Naslovna):**  
  Nadnaslov: `MOJAUTODILER • AUTO MAGAZIN`  
  Naslov: `178.000 km na tabli, a u realnosti 320.000?`  
  Podnaslov: `Kako da prepoznate vraćenu kilometražu pre kupovine.`
- **Slajd 2 (Fizički znaci):**  
  Naslov: `5 detalja u kabini koji ne lažu`  
  Stavke: `1. Sjajan ili presvučen volan` / `2. Izlizane ili potpuno nove pedale` / `3. Propadanje leve bočne potpore sedišta` / `4. Oguljeni tasteri stakala i svetala` / `5. Zaboravljene servisne nalepnice ispod haube`
- **Slajd 3 (Dijagnostika modula):**  
  Naslov: `Instrument tabla se lako menja. Ovi moduli ne.`  
  Stavke: `• ECU (radni sati motora)` / `• TCU (memorija automatskog menjača)` / `• ABS i ESP moduli` / `• Pepeo u DPF filteru` / `• Memorija elektronskog ključa`
- **Slajd 4 (VIN provera):**  
  Naslov: `Prvi filter pre nego što sednete u auto`  
  Tekst: `Proverite broj šasije (VIN) u međunarodnim bazama pre puta na plac. Ako grafik kilometraže ima nagli pad, uštedeli ste i vreme i novac.`
- **Slajd 5 (CTA):**  
  Naslov: `Pročitaj ceo vodič + zakonska prava u Srbiji`  
  Tekst: `Član 208. KZ RS, Zakon o zaštiti potrošača i korak-po-korak plan ako otkrijete prevaru.`  
  Dugme/oznaka: `Link u opisu profila • mojautodiler.com`

### Opis Instagram objave (Caption)

Na oglasima u Srbiji gotovo svaki drugi desetogodišnji dizel ima „pravih 178.000 km”. 

Problem je što vraćena kilometraža ne košta samo u trenutku kupovine. Kada kupite auto sa skrivenih 150.000 km više, na red ubrzo dolaze dizne, DPF, zamajac i menjač.

U prvom vodiču našeg novog **Auto magazina** prošli smo kroz sve što kupac u Srbiji mora da proveri pre davanja kapare:
- 5 fizičkih znakova habanja koje vidite za 3 minuta bez alata
- Koje elektronske module majstor mora da očita na dijagnostici
- Kako funkcioniše provera preko broja šasije (VIN)
- Koja su vaša zakonska prava ako kupujete od auto-placa, a koja od fizičkog lica

Sačuvaj ovu objavu za sledeću kupovinu automobila i pošalji prijatelju koji trenutno traži polovnjaka.

Ceo vodič te čeka na linku u opisu profila (Auto magazin na MojAutoDiler.com).

#polovniautomobili #kupovinaautomobila #vracenakilometraza #automobili #srbija #beograd #novisad #nis #proveravozila #mojautodiler #automagazin #polovnjaci

---

## 4. Instagram i Facebook Story (sekvenca od 3 kadra, 1080×1920 px)

### Kadar 1 (Hook + Anketa)
- **Pozadina:** Tamna fotografija digitalne instrument table (`vracena-kilometraza-prevara-provera.jpg` kropovana u 9:16 sa tamnim gradijentom).
- **Tekst na vrhu:** `AUTO MAGAZIN • NOVI VODIČ`
- **Glavni tekst:** `Veruješ li kilometraži na oglasima u Srbiji?`
- **Interaktivni stikeri (Anketa):**
  - Opcija 1: `Samo uz VIN i dijagnostiku`
  - Opcija 2: `Retko, skoro uvek proveravam`

### Kadar 2 (Konkretna vrednost)
- **Pozadina:** Čista tamna kartica (`#0F0F14`) sa zlatnim akcentom (`#C9A84C`).
- **Naslov:** `3 provere pre nego što daš kaparu:`
- **Tekst:**
  1. `Enterijer: volan, pedale, bočna potpora sedišta i nalepnice ispod haube.`
  2. `Dijagnostika: radni sati u ECU, memorija menjača (TCU) i pepeo u DPF-u.`
  3. `VIN provera: hronologija kilometraže iz inostranih registara.`

### Kadar 3 (Poziv na čitanje + Link sticker)
- **Pozadina:** Fotografija instrument table + suptilan MojAutoDiler logo u dnu.
- **Naslov:** `Vraćena kilometraža: Kako prepoznati prevaru i šta kaže zakon u Srbiji`
- **Podnaslov:** `Pročitaj prvi vodič u našem novom Auto magazinu.`
- **Link sticker tekst:** `Pročitaj ceo vodič`
- **Instagram Story URL:**  
  `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=instagram&utm_medium=story&utm_campaign=auto_magazin_launch_01&utm_content=ig_story_frame3`
- **Facebook Story URL:**  
  `https://www.mojautodiler.com/sr/blog/vracena-kilometraza-kako-prepoznati-prevaru?utm_source=facebook&utm_medium=story&utm_campaign=auto_magazin_launch_01&utm_content=fb_story_frame3`

---

## 5. Predlog vizuala za društvene mreže

1. **Osnovna fotografija:** Koristiti postojeću naslovnu fotografiju visoke rezolucije `public/blog/vracena-kilometraza-prevara-provera.jpg` (1600×900 px) kao bazu, kako bi vizual na društvenim mrežama bio odmah prepoznatljiv kada korisnik klikne na članak (visoka konzistentnost oglasa i odredišne stranice).
2. **Paleta boja (usklađena sa sajtom MojAutoDiler):**
   - Primarna tamna podloga / overlay: `#0F0F14` (75–85% neprozirnost pri dnu za čitljivost teksta)
   - Zlatni akcenat za nadnaslov i ključne reči: `#C9A84C` / `#E8C97A`
   - Tekst: `#FFFFFF` (visok kontrast, WCAG AA+)
3. **Tipografija:**
   - Naslovi: `Syne` (Bold / ExtraBold), kratki, do 7–9 reči na slici
   - Podnaslovi i stavke: `DM Sans` (Medium / SemiBold)
4. **Dimenzije za izvoz:**
   - **Facebook link preview (OG):** `1200 × 630 px` (JPG, već podešeno kao `ogImage` članka)
   - **Instagram / Facebook Feed:** `1080 × 1350 px` (4:5 portret zauzima najviše prostora na mobilnom ekranu)
   - **Instagram / Facebook Story:** `1080 × 1920 px` (9:16, ostaviti gornjih 250 px i donjih 300 px slobodno zbog UI elemenata aplikacija i Link stickera)
5. **Pravilo čistog dizajna:** Ne stavljati više od 20% teksta na naslovnu sliku; u gornjem levom uglu staviti diskretan bedž `AUTO MAGAZIN`, a u donjem uglu čist `MojAutoDiler` logo bez pretrpavanja.
