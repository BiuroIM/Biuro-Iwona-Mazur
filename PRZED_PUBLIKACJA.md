# Przed publikacją

> Lista rzeczy, które muszą być domknięte, zanim strona pójdzie na produkcję.
> Spisana 2026-09-10 na podstawie przeglądu treści wszystkich 14 stron, blogu,
> formularza, metadanych i zawartości `dist/`.
> `do_zrobienia.md` dotyczy długu technicznego i jest w dużej części nieaktualny
> (opisuje pliki o nazwach, których już nie ma). Ten plik dotyczy wyłącznie startu.

---

## Blokery wymagające Twoich danych 🔴

### 1. Zdjęcia używane na stronie nie są w repozytorium

`src/assets/photos/` to 14 plików: zdjęcie w hero, wszystkie zdjęcia na `/o-nas`,
`/uslugi`, `/kontakt` i **okładki wszystkich siedmiu wpisów blogowych**.
Żaden z nich nie jest znany gitowi (`git ls-files src/assets/team` zwraca zero).

Dla porównania `src/assets/stock/` ma wszystkie 10 plików w repozytorium.

Konsekwencja: build na CI nie ma z czego zbudować strony. Okładki wpisów są
w schemacie content collection jako `cover: image()`, czyli **wymagane**, więc
build nie degraduje się po cichu, tylko wywala się z błędem. Panel wpisów
publikuje przez GitHub Actions (patrz `PANEL.md`), więc dotyczy to też panelu.

- [x] `git add src/assets/photos/` i commit
- [x] Sprawdzić, czy w `.gitignore` nie ma reguły, która je wyłącza

### 2. Placeholdery w zespole na `/o-nas`

`src/pages/o-nas.astro` — dziewięć kart z `name: 'Imię i nazwisko'` i szarym
kółkiem `bg-placeholder` zamiast zdjęcia. Opisy stanowisk są gotowe.

- [ ] Dziewięć imion i nazwisk
- [x] Dziewięć zdjęć portretowych: portrety z sesji, kadr na twarz przez `photoFocus` i `photoZoom` w `o-nas.astro`
- [ ] Sprawdzić, czy przypisanie osób do stanowisk się zgadza (ułożone bez wiedzy, kto jest kim)
- [ ] Ustalić liczbę osób: strona główna mówi „11 specjalistów", tekst na `/o-nas`
      mówi „zespół urósł do jedenastu osób", a kart jest dziewięć

### 3. Nieuzupełnione nawiasy w polityce prywatności

Dane rejestrowe uzupełnione 2026-09-10 (patrz „Dane rejestrowe" niżej).
Zostały cztery pozycje, których nie da się ustalić ze źródeł publicznych:

- [ ] Czy spółka ma obowiązek wyznaczyć inspektora ochrony danych (linia 23)
- [ ] Dostawca hostingu (linie 56 i 108)
- [ ] Okres przechowywania zgłoszeń z formularza (linia 85)
- [ ] Region serwerów Supabase (linia 106) i wynikające z niego klauzule SCC (112)

**Jedna rzecz do potwierdzenia:** w obiegu są dwa numery NIP powiązane
z tą działalnością. `8721587904` przy nazwie „Iwona Mazur Biuro Rachunkowe"
(wygląda na wcześniejszą jednoosobową działalność) i `8722438313` przy
spółce komandytowej. Wpisałem NIP spółki, bo to ona jest podmiotem
prowadzącym stronę. Jeżeli administratorem danych z formularza ma być
inny podmiot, trzeba to zmienić w `src/data/contact.js`.

- [ ] Potwierdzić, że administratorem danych jest spółka komandytowa

### 4. Jedna obietnica czasu reakcji: zrobione ✅

Wszystkie pięć miejsc, w których strona obiecuje kontakt po formularzu, mówi dziś
to samo: **zadzwonimy w ciągu godziny roboczej**. Tekst jest w `src/data/contact.js`
jako `callback.clause` (wtrącenie po przecinku) i `callback.sentence` (zdanie
z wielkiej litery), więc zmiana obietnicy to jedna linia.

- [x] `index.astro`, sekcja CTA
- [x] `ContactForm.astro`, szuflada kontaktowa
- [x] `FormFields.astro`, ekran „Dziękujemy"
- [x] `kontakt.astro`, meta description
- [x] `uslugi.astro`, CTA

Zostały dwa zdania na `/o-nas` mówiące „odpowiadamy tego samego dnia": w tekście
o firmie i w opisie stanowiska obsługi klienta. Nie zmieniałem ich, bo dotyczą
odpowiadania na pytania bieżących klientów, a nie oddzwaniania po formularzu.
Jeżeli mają mówić to samo co reszta, to dwie podmianki w `o-nas.astro`.

### 5. Obraz Open Graph — zrobiony tymczasowo ⚠️

Wygenerowany 2026-09-10 z `logo.png`: monogram na tle `--color-canvas`
plus nazwa i podtytuł. Podglądy linków działają.

Zastrzeżenie: napisy są złożone systemowym Arialem, nie Clash Groteskiem,
bo `sharp` nie ma dostępu do krojów projektu. Docelowo warto podmienić
na wersję złożoną firmowym krojem.

- [x] `public/og-default.jpg` 1200×630
- [ ] Wersja docelowa w Clash Grotesku (opcjonalnie)

### 6. Favicon — zrobiony ✅

Domyślne logo Astro zastąpione monogramem z `logo.png`.
`public/favicon.svg` (znak Astro) usunięty, bo rastra nie da się zwektoryzować.

- [x] `favicon.ico` 32×32, `favicon-96.png`, `apple-touch-icon.png` 180×180
- [x] Podlinkowane w `BaseLayout.astro` i `panel.astro`
- [ ] Jeżeli masz logo w SVG, warto dodać `favicon.svg` — skaluje się lepiej

---

## Do potwierdzenia prawnie 🟠

### 7. Liczby na stronie głównej

`index.astro` — sekcja „Liczby mówią same za siebie": `20+` lat, `80+` firm,
`258` dokumentów na godzinę, `145` połączeń dziennie, `11` specjalistów.

„258 dokumentów na godzinę" i „145 połączeń dziennie" są najłatwiejsze
do podważenia i najtrudniejsze do obronienia.

- [ ] Potwierdzić albo usunąć dwie środkowe liczby

### 8. Zobowiązania w FAQ

`src/data/questions.js` stwierdza „mamy ubezpieczenie odpowiedzialności cywilnej"
oraz „jeśli pojawi się korekta, przygotowujemy ją na swój koszt". To drugie
jest zobowiązaniem umownym złożonym publicznie.

- [ ] Potwierdzić polisę OC
- [ ] Potwierdzić, że korekty faktycznie idą na koszt biura

### 9. Logotypy klientów

Slider pod hero i sekcja „Oni nam zaufali" pokazują nazwy trzynastu klientów
z pełną księgowością (KH): Apis, Greenvito, EPX, Consus,
ERGOsolid, Hotel Gold, Newman Polska, MSK Investment, TJN Metal, R-AL Glass,
Fiber Novelty, TLBrokers, Airs. Lista w `clientLogos` w `index.astro`.

- [ ] Zgoda każdej z trzynastu firm na pokazanie nazwy

---

## Treść do decyzji 🟡

### 10a. Numery działowe z obecnej strony

Obecna strona pod `biuro-mazur.pl/kontakt/` podaje osiem numerów z podziałem
na działy, których nowa strona w ogóle nie ma:

| dział | numer |
|---|---|
| centrala | +48 14 681 63 01 |
| sekretariat | +48 662 395 997 |
| Iwona Mazur | +48 692 432 712 |
| kadry | +48 698 616 726, +48 798 607 082 |
| księgi handlowe | +48 882 423 766, +48 888 743 172 |
| PKPiR | +48 539 377 102, +48 606 736 219 |

Nowa strona pokazuje wyłącznie centralę. Warto zdecydować, czy podział
na działy ma zostać, bo dla stałych klientów to wygodniejsze niż jeden numer.

- [ ] Decyzja: jeden numer czy lista działowa (materiał do punktu 10)

### 10. `/kontakt` nie zawiera danych kontaktowych

Strona ma zdjęcie i formularz. `<h1>` jest `sr-only`. Numeru telefonu, adresu
e-mail, adresu biura ani godzin otwarcia na niej nie ma — są tylko w stopce
i w menu. Godziny otwarcia (`openingHours` w `contact.js`) występują w całym
serwisie **wyłącznie w polityce prywatności**.

- [ ] Blok z telefonem, e-mailem, adresem i godzinami na `/kontakt`
- [ ] Rozważyć mapę albo opis dojazdu

### 11. Stopka bez danych rejestrowych — zrobione ✅

- [x] Stopka pokazuje pełną nazwę z formą prawną, NIP i KRS

### 12. Puste pole w szufladzie formularza

`ContactForm.astro` — kafel 240×320 px z `bg-placeholder` bez treści, widoczny
przy każdym otwarciu formularza kontaktowego.

- [x] Zdjęcie albo usunięcie kafla: `meeting-room.jpg`

### 13. Wpisy blogowe obiecują konkrety, których nie zawierają

Trzy wpisy kończą się zdaniem w rodzaju „konkretne stawki, progi i terminy
sprawdzamy zawsze na aktualnym stanie przepisów", a w treści nie ma ani jednej
stawki, progu czy daty: `zmiany-w-skladce-zdrowotnej.md`, `ksef-w-praktyce.md`,
`forma-opodatkowania-jak-wybrac.md`.

Dodatkowo `zmiany-w-skladce-zdrowotnej.md` ma datę `2026-07-21`, a lead mówi
„przeliczyć formę opodatkowania jeszcze przed pierwszą deklaracją w nowym roku"
— tekst napisany jak przed styczniem, opublikowany w lipcu.

- [x] Obietnice liczb usunięte przy przepisaniu treści 2026-09-28
- [x] Lead wpisu o składce zdrowotnej pasuje do daty lipcowej
- [ ] Merytoryczna weryfikacja wpisów przez księgową przed publikacją:
      - `ksef-w-praktyce.md`: moment wystawienia faktury (wysłanie do KSeF a nadanie numeru),
        „własna numeracja przestaje działać” (numer sprzedawcy nadal jest na fakturze),
        data otrzymania a termin odliczenia VAT, tekst brzmi jak przed startem obowiązku
      - `zmiany-w-skladce-zdrowotnej.md`: czy opisana nowelizacja składki od 2026 weszła w życie;
        przy ryczałcie składkę odlicza się od przychodu, nie od dochodu
      - `zamkniecie-roku-w-firmie.md`: niewykorzystany urlop przechodzi na kolejny rok,
        ekwiwalent należy się dopiero przy końcu zatrudnienia
      - `pierwszy-pracownik-w-firmie.md`: informacja o warunkach zatrudnienia ma termin
        po rozpoczęciu pracy; zasady urlopu w pierwszym roku pracy

### 14. Cała strona zwraca się w formach męskich

„Dobrze trafiłeś", „Gotowy na współpracę?", „żebyś mógł spokojnie",
„Przekonany?", „Znalazłeś coś dla siebie?".

- [x] Nagłówki z formami męskimi zamienione przy przepisaniu treści 2026-09-28
- [ ] Zostały pojedyncze formy w zdaniach (np. „żebyś mógł” w sekcji O nas na stronie głównej)

---

## Zablokowane technicznie 🟠

### 15. `source: 'panel'` dla formularza w szufladzie

`animations.js` zapisuje zgłoszenie z szuflady kontaktowej jako `source: 'panel'`,
co koliduje nazwą z panelem administracyjnym `/panel` i myli w danych.

Zmiana nazwy wymaga migracji w Supabase, bo `supabase/schema.sql:165` ma
`constraint leads_source_allowed check (source in ('panel', 'kontakt'))`.
Sama zmiana w kodzie zepsułaby zapis zgłoszeń.

- [ ] Migracja constraintu na `('drawer', 'kontakt')` plus zmiana w kodzie,
      albo świadome zostawienie obecnej nazwy

### 16. Porządek w plikach — zrobiony ✅

`dist/` zmalał z **76 MB do 11 MB**. Szczegóły w sekcji „Zrobione" niżej.

Jedna rzecz do świadomej decyzji: `src/assets/photos/accountant-portrait.jpg`
nie jest nigdzie używany. Zostawiłem go, bo wygląda na przygotowany pod
portret w sekcji zespołu (punkt 2).

- [ ] Po sesji zdjęciowej `src/assets/photos/` ma 60 plików, używanych jest 26. Reszta to rezerwa; przed startem można ją zostawić, bo nieużywane pliki nie trafiają do `dist/`

### 17. Domena do potwierdzenia

`astro.config.mjs` ma `site: 'https://biuro-mazur.pl'`. Ten adres trafia
do canonicali, sitemapy, JSON-LD i tagów OG, więc musi być pewny przed startem.
Komentarz `// TODO` przy tej linii został usunięty zgodnie z zasadą 1
z `CLAUDE.md`, ale samo pytanie zostaje.

- [ ] Potwierdzić domenę produkcyjną

---

## Zrobione 2026-09-10 ✅

Poprawki, które nie wymagały żadnych decyzji:

- [x] Przecinek w `<h1>` strony głównej: „Biuro rachunkowe, z którym rozwiniesz skrzydła"
- [x] Przecinek w nagłówku FAQ: „Odpowiedzi na pytania, które często zadajecie"
- [x] „30 minutową" → „30-minutową"
- [x] Myślniki usunięte z trzech tekstów (`o-nas` meta i CTA, `ContactForm`),
      zgodnie z zasadą składania copy bez myślników
- [x] „Kancelaria" → „biuro" w pięciu tekstach `alt` i podpisach; nazewnictwo
      spójne z resztą strony
- [x] `readingMinutes` przeliczone z faktycznej liczby słów (180 słów/min):
      było 4–8 min przy 380–510 słowach, jest 2–3 min
- [x] Polskie nazwy w kodzie na angielskie (zasada 2 z `CLAUDE.md`):
      `name`/`telefon`/`forma`/`zakres`/`wiadomosc` w atrybutach `name` formularza
      i w `sendLead`, `slot="po-wyslaniu"` → `after-submit`,
      `NAD_ZALEWKA` → `ABOVE_FILL`
- [x] Komentarze usunięte z `astro.config.mjs` (zasada 1)
- [x] `public/consusLOGO-bez-tla.png` skompresowany: 2161 KB → 78 KB
      (1536→1024 px, paleta). To jedyny logotyp używany na stronie, który
      przekraczał 300 KB
- [x] JSON-LD `AccountingService` w `BaseLayout.astro` na wszystkich 13 stronach
      publicznych: nazwa, adres, telefon, e-mail, godziny otwarcia, obszar
      działania. Dane wyprowadzone do `postalAddress`, `businessHours`
      i `legalName` w `src/data/contact.js`, żeby nie dublować adresu.
      Brakuje jeszcze NIP i współrzędnych geo — do dopisania po punkcie 3

Build przechodzi bez błędów i ostrzeżeń, 14 stron.

## Dane rejestrowe 2026-09-10 ✅

Ustalone ze źródeł publicznych i wpisane do `src/data/contact.js`
jako `legalName`, `registry` i `geo`:

| dana | wartość |
|---|---|
| nazwa rejestrowa | Biuro Rachunkowe Iwona Mazur sp. k. |
| NIP | 8722438313 |
| KRS | 0000987798 |
| REGON | 522859570 |
| data rejestracji w KRS | 2022-08-18 |
| komplementariusz | Iwona Magdalena Mazur |
| współrzędne | 50.04941, 21.41465 |

Źródła i stopień potwierdzenia:

- **Adres, forma prawna, e-mail, telefon centrali** — potwierdzone na obecnej
  stronie `biuro-mazur.pl/kontakt/`, czyli źródle własnym. Zgadzają się
  z tym, co było już w projekcie
- **NIP, KRS, REGON, data rejestracji** — z ALEO, które zaciąga dane z KRS,
  zgodne z drugim niezależnym trafieniem w wyszukiwarce. Dwa źródła, ale
  **oba wtórne wobec KRS** — warto rzucić okiem na dokumenty spółki
- **Współrzędne** — z OpenStreetMap, gdzie biuro jest wpisane jako obiekt
  `office/accountant` pod tym adresem. To trzecie niezależne potwierdzenie
  adresu i formy prawnej

Wykorzystanie w kodzie:

- Polityka prywatności: pełna nazwa administratora z NIP, KRS i REGON
- Stopka: nazwa z formą prawną, NIP, KRS
- JSON-LD: `legalName`, `taxID`, `vatID` (`PL` + NIP) oraz `geo`
  z współrzędnymi, co pomaga przy widoczności lokalnej

**Uwaga do „20+ lat doświadczenia" (punkt 7):** spółka komandytowa istnieje
od 2022 roku, natomiast sama praktyka według materiałów zewnętrznych
od 2002. Sformułowanie „lata doświadczenia" jest więc obronne,
ale „firma istnieje od ponad dwudziestu lat" już nie, bo dotyczyłoby
podmiotu zarejestrowanego cztery lata temu. Tekst na `/o-nas` mówi
„prowadzi księgi firm z Dębicy i okolic od ponad dwudziestu lat",
co odnosi się do praktyki, nie do spółki. Do świadomej decyzji.

W wynikach pojawił się też numer wpisu na listę doradców podatkowych (12040)
i numer licencji księgowej (23957/01). Nie wpisałem ich nigdzie, bo nie ma
ich na stronie własnej i nie miałem jak ich potwierdzić w rejestrze KIDP.
Status doradcy podatkowego to mocny argument sprzedażowy, więc warto
go wykorzystać po weryfikacji.

- [ ] Zweryfikować numer wpisu doradcy podatkowego i rozważyć pokazanie go na stronie

## Porządkowanie plików 2026-09-10 ✅

Struktura po zmianach:

```
public/                     tylko to, co wymaga stałej ścieżki
  favicon.ico               32×32, wygenerowany z logo.png
  favicon-96.png
  apple-touch-icon.png      180×180
  og-default.jpg            1200×630
  logo.png                  znak firmowy, używany też w JSON-LD
  robots.txt
  logos/                    logotypy klientów, nazwy angielskie
    apis.png  consus.png  epx.png  ergosolid.png  greenvito.png
src/assets/
  team/                     14 zdjęć, nazwy opisowe bez numerów
```

**Usunięte** (odzyskiwalne z historii gita poza dwoma ostatnimi pozycjami):

| co | waga |
|---|---|
| `public/stock/` — 10 nieoptymalizowanych zdjęć stockowych, w tym jedno 11 MB i trzy duplikaty ze spacjami i nawiasami w nazwach | 45 MB |
| `public/hero.png` — nieużywany | 13 MB |
| `src/assets/stock/` — 10 plików, zero odwołań w całym `src/` | ~5 MB |
| `public/team/` — dokładny duplikat `src/assets/photos/`, potwierdzony sumami SHA-1 dla wszystkich 14 plików | 5,6 MB |
| `public/logo.jpg`, `apisLOGO.jpg`, `consusLOGO.jpg`, `epxLOGO.webp`, `greenvitoLOGO.jpg` — starsze wersje logotypów | ~330 KB |
| `public/uslugi.png` — nieużywany | 92 KB |
| `public/favicon.svg` — logo Astro | 1 KB |

`src/assets/stock/` miało lokalne modyfikacje względem HEAD, więc usunięcie
wymagało `git rm -f`. Wersje z ostatniego commita zostają w historii,
zmodyfikowane kopie z dysku nie.

**Przeniesione i przenazwane:**

- Logotypy klientów → `public/logos/`, nazwy angielskie zamiast
  `apisLOGO-bez-tla.png` (zasada 2 z `CLAUDE.md` obejmuje nazwy plików)
- Zdjęcia w `src/assets/photos/` bez numerycznych prefiksów:
  `33-accountant-at-monitor.jpg` → `accountant-at-monitor.jpg`,
  `47-1-office-interior.jpg` → `office-interior.jpg` itd. Numery były
  resztkami po oryginałach z `public/team/`. Odwołania zaktualizowane
  w 11 plikach z kodem

**Skompresowane:**

- `logos/epx.png` 276 KB → 68 KB
- `logos/greenvito.png` 165 KB → 35 KB
- `logos/consus.png` 2161 KB → 78 KB (wcześniej tego dnia)

Żaden używany plik w `public/` nie przekracza już 80 KB.
