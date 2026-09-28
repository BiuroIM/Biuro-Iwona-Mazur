# Zdjęcia na stronie

Pliki źródłowe leżą w `src/assets/` (sesja własna zespołu w `src/assets/photos/`).
Wchodzą przez `astro:assets` (`<Image>`), więc Astro sama robi z nich WebP i warianty
szerokości — w repo trzymamy tylko oryginał.

Kopie wprost od fotografa leżą w `public/team/`, pod oryginalnymi numerami z sesji
(`112_websize.jpg`, `47.1.jpg`, …). **To materiał źródłowy, nie zasób strony:** do
wyświetlania służą wyłącznie pliki z `src/assets/photos/`. Nazwy w `src/assets/photos/`
zaczynają się od numeru z sesji i mają dalej angielski opis
(`61-open-space-conversation.jpg`), żeby dało się jednocześnie mówić o zdjęciu numerem,
tak jak mówi o nim fotograf, i widzieć w kodzie, co to za kadr.

## Rozdzielczość tej sesji

Pliki od fotografa mają **1600 px na dłuższym boku** i 1,0-2,6 bita na piksel, czyli
detalu w nich nie brakuje — poprzedni zestaw stockowy miał 2560 px, ale przy podobnym
bpp. Nie ma z czego zrobić wariantu większego niż 1600 px, więc `widths` wszędzie kończy
się na 1600.

⚠️ **Skutek dla kadrów powitalnych na `/uslugi` i `/o-nas`:** miały w `widths` wariant
2400 px, bo na telefonie malują pas ~1196 px i przy ekranie 2× potrzebują 2392 px.
Ten wariant zniknął, bo źródło go nie unosi. Na telefonie 2× te dwa kadry są więc
rozciągane około 1,5 raza. Jeżeli ma to zniknąć, potrzebne są pliki z sesji w pełnej
rozdzielczości, a nie „websize" — wtedy wrócić do `widths={[768, 1280, 1800, 2400]}`.
Nie da się tego naprawić po stronie kodu.

## Licencja

Zdjęcia są **własne**: sesja zespołu i wnętrz biura, zrobiona na zamówienie kancelarii.
Nie ma tu problemu licencji stockowej ani model release, który wisiał nad poprzednim
zestawem.

Do uzupełnienia zostaje jedno: **autor sesji i data**, żeby dało się wrócić po oryginały
w pełnej rozdzielczości (patrz wyżej, kadry powitalne ich potrzebują).

## Dobór

Cała strona stoi teraz na zdjęciach prawdziwego zespołu i prawdziwego biura. Znika przez
to zastrzeżenie, które ciągnęło się przez dwa poprzednie zestawy: osoba na zdjęciu czyta
się jak pracownik biura i **nim jest**.

Zdjęcie `112` (cała ekipa ustawiona w rzędzie) jest pierwszym zdjęciem na stronie, przy
napisie MAZUR. To była wprost postawiona decyzja, nie wynik doboru kadru: grupa ma
otwierać stronę.

### Kafelki specjalistów są prowizoryczne

Podstrona o zespole („nasi specjaliści", dziewięć kafelków przy imionach i rolach) ma
w kółkach zdjęcia **przykładowe**. Imiona w tych kafelkach to nadal `Imię i nazwisko`,
a sesja **nie zawiera portretów przypisanych do imion** — dobór twarzy do roli jest więc
arbitralny i ma tylko pokazać, jak sekcja wygląda z ludźmi zamiast szarych kółek.
Zanim to pójdzie do klienta, potrzebne są portrety z podpisami od kancelarii, kto jest kim.

Sesja daje osiem osób w kadrach, z których da się wyciąć twarz, a kafelków jest dziewięć,
więc dwie osoby powtarzają się w dwóch kadrach i jedno zdjęcie
(`client-conversation.jpg`) obsługuje dwa kafelki, kadrowane na dwie różne osoby.
Powtórki stoją daleko od siebie w kolejności kafelków. Przy prawdziwych portretach
problem znika sam.

Nie da się tu użyć `team-group.jpg`: przy 1600 px na dwanaście osób jedna głowa ma
około 60 px, czyli mniej niż kółko na telefonie.

## Spis

Kolejność jak na stronie, z góry na dół. Numer w nazwie pliku to numer klatki z sesji.

### Strona główna

| Plik (`src/assets/photos/`) | Miejsce na stronie |
| --- | --- |
| `112-team-group.jpg` | hero, zdjęcie przy napisie MAZUR |
| `84-two-accountants-documents.jpg` | wiersz trzech zdjęć, kolumna 1 (wyższa) |
| `61-open-space-conversation.jpg` | wiersz trzech zdjęć, kolumna 2 |
| `73-client-conversation.jpg` | wiersz trzech zdjęć, kolumna 3 (pod akapitem o usługach) |
| `66-accountant-at-workstation.jpg` | sekcja FAQ (widoczna od `lg`) |

### Podstrony

| Plik (`src/assets/photos/`) | Miejsce na stronie |
| --- | --- |
| `54-two-accountants-at-desk.jpg` | `o-nas`, kadr powitalny pod karuzelą napisu |
| `47-1-office-interior.jpg` | `uslugi`, kadr powitalny pod karuzelą napisu |
| `57-accountant-with-laptop.jpg` | `kontakt`, kadr 3:4 w karcie formularza |

### Kafelki specjalistów na `o-nas`

Kolejność jak w `specialists` w `src/pages/o-nas.astro`. `photoFocus` i `photoZoom`
opisuje „Kadrowanie do kółka" niżej.

| Plik (`src/assets/photos/`) | Dział | `photoFocus` | `photoZoom` |
| --- | --- | --- | --- |
| `accountant-at-workstation.jpg` | Księgowość | `center 30%` | 1 |
| `accountant-portrait.jpg` | Doradztwo podatkowe | `center top` | 1 |
| `reviewing-documents.jpg` | Kadry i płace | `65% center` | 1.8 |
| `accountant-at-computer.jpg` | Księgowość | `60% center` | 1 |
| `client-conversation.jpg` | Rozliczenia ZUS | `right 30%` | 1.4 |
| `two-accountants-documents.jpg` | Księgowość | `center top` | 1.5 |
| `open-space-conversation.jpg` | Podatek VAT | `25% 58%` | 2 |
| `accountant-at-monitor.jpg` | Analizy finansowe | `40% center` | 1.2 |
| `client-conversation.jpg` | Obsługa klienta | `15% 35%` | 1.6 |

### Okładki wpisów

| Plik (`src/assets/photos/`) | Wpis |
| --- | --- |
| `33-accountant-at-monitor.jpg` | „Ewidencja VAT: sześć błędów, które kosztują najwięcej" |
| `70-1-accountant-at-computer.jpg` | „Dokumenty do księgowości online" |
| `73-1-reviewing-documents.jpg` | „Ryczałt, liniowy czy skala" |
| `69-1-conversation-by-logo-wall.jpg` | „KSeF w praktyce" |
| `37-meeting-room.jpg` | „Pierwszy pracownik w firmie" |
| `73-client-conversation.jpg` | „Jak przygotować firmę do zamknięcia roku" |
| `54-two-accountants-at-desk.jpg` | „Zmiany w składce zdrowotnej od 2026 roku" |

Dwa pliki są użyte dwa razy (`73-client-conversation`, `54-two-accountants-at-desk`),
za każdym razem w kadrze o innych proporcjach, więc widać w nich inny fragment.

## Kadrowanie

Każde zdjęcie ma parallax (`.parallax-img` + `data-parallax`, opis w `animacje.md`),
czyli **kadr pokazuje pas zdjęcia, który przesuwa się przy przewijaniu** — raz wyżej,
raz niżej. Dlatego przy podmianie zdjęcia nie wystarczy, że dobrze wygląda w spoczynku:
sprawdź je też w chwili wjazdu w kadr, bo wtedy kadr stoi najniżej i to wtedy ścina
czubki głów. Siłę ruchu reguluje jedna liczba (`--parallax`, domyślnie 6%).

Zdjęcia w tym zestawie mają proporcje 7:5 (poziome) albo 5:7 (pionowe), a kadry na
stronie idą od 2,32:1 (hero) do 3:4 (FAQ, kontakt) — czyli wycinają z nich bardzo różne
fragmenty. Do slotów pionowych trafiły zdjęcia pionowe (`66`, `57`), a do szerokich
poziome, bo `object-cover` skaluje do krótszego boku kadru i obcina drugi.

Mieszanie orientacji ze slotem kończy się ucięciem twarzy: pionowy `79` wstawiony jako
okładka 3:2 pokazywał tors bez głowy. Jeżeli w slocie szerokim musi stanąć zdjęcie
pionowe, sam dobór pliku nie wystarczy — trzeba dołożyć `object-position`.

### Kadrowanie do kółka specjalisty

Kółko ma najwyżej 136 px, a zdjęcia są scenami, nie portretami: twarz zwykle nie stoi
w środku kadru i bywa mała. Dlatego kafelek ma dwa pola w `specialists`:

- `photoFocus` — trafia jednocześnie do `object-position` i do `transform-origin`,
- `photoZoom` — mnożnik w `transform: scale()`.

Wspólna wartość dla obu właściwości jest tu sensowna, bo `object-fit: cover` przycina
tylko jedną oś: przy zdjęciu poziomym w kwadracie luz jest w poziomie, więc pionowa
składowa `object-position` nic nie robi i można nią sterować samym punktem zoomu
(przy pionowym odwrotnie). Efekt: `photoFocus` wskazuje twarz, a `photoZoom` przybliża
wokół niej, zamiast wokół środka kadru.

Wartości dobierane są na oko i sprawdzane w kółku 136 px, nie liczone z rozmiaru pliku.
Przy podmianie zdjęcia trzeba je dobrać od nowa.

Zoom podnosi też malowany pas: `sizes` w kafelku to `19vw` na szerokim ekranie i
`45vw` w suwaku na telefonie, czyli szerokość kółka razy narzut `cover` razy zoom.
Gdyby `photoZoom` gdzieś przekroczyło 2, `sizes` i `widths` trzeba podnieść razem z nim.

### Zdjęcie grupowe na telefonie

Hero na stronie głównej jest wyjątkiem od parallaxu: `112-team-group.jpg` to cały zespół
ustawiony w rzędzie, więc **każde obcięcie boku zabiera konkretną osobę**. Poniżej `64rem`
kadr dostaje dokładne proporcje pliku (`max-lg:aspect-[1600/1143]`), a zdjęcie klasę
`.parallax-img--whole`, która zeruje tam parallax. Efekt: na telefonie widać całą jedenastkę,
bez ruchu; od `lg` w górę parallax wraca i kadr 2,32:1 pokazuje pas, tak jak wszędzie indziej.

Mechanizm klasy opisuje `animacje.md`. Jeżeli zdjęcie hero kiedyś się zmieni, **trzeba
razem z nim zmienić `aspect-[1600/1143]`** na proporcje nowego pliku, inaczej boki znowu
zaczną znikać.

## `sizes` opisuje malowany pas, nie szerokość kadru

To najłatwiejsza do przeoczenia rzecz w tym pliku i przez nią zdjęcia były rozciągane
nawet 1,9 raza.

`object-fit: cover` przy zdjęciu 3:2 w kadrze pionowym skaluje obraz do **wysokości**
kadru i obcina boki. Przeglądarka maluje więc pas o szerokości `wysokość_kadru × 1,5`,
znacznie szerszy niż widoczny kadr. `.parallax-img` dokłada do tego jeszcze
`height: 100% + 2 × --parallax`, czyli kolejne kilkanaście procent.

Przykład: kadr przy formularzu na `/kontakt` ma 324 px szerokości, ale przeglądarka
maluje w nim pas o szerokości 752 px. Gdy `sizes` mówi „25vw" (czyli 360 px), dobrany
plik jest ponad dwa razy za mały i widać rozmycie mimo poprawnego źródła.

**Jak dobrać wartość:** zmierz w przeglądarce, nie licz z układu. Dla elementu `img`:

```js
const box = img.getBoundingClientRect();
const pas = Math.max(box.width, box.height * (img.naturalWidth / img.naturalHeight));
console.log((pas / innerWidth * 100).toFixed(1) + 'vw');
```

Zmierz osobno dla szerokiego ekranu i dla telefonu, bo kadry zmieniają proporcje przy
`max-lg`. Potem `widths` musi sięgać `pas × 2` (dla ekranów 2×), inaczej deklaracja
w `sizes` nic nie da.

Jeden kadr jest świadomym kompromisem: hero na `/uslugi` i `/o-nas` na telefonie ma
359×796 px, czyli maluje pas 1196 px i przy 2× potrzebuje 2392 px. W zestawie stockowym
te dwa zdjęcia miały na to wariant 2400 px w `widths`. Sesja własna ma 1600 px na
dłuższym boku, więc tego wariantu już nie ma i `widths` kończy się na 1600 — powód
i warunek powrotu opisuje „Rozdzielczość tej sesji" na górze tego pliku.

`sizes` zostaje bez zmian (`"(width < 64rem) 300vw, 95vw"`), bo nadal poprawnie opisuje
malowany pas. Zmieniło się tylko to, że przeglądarka nie ma już czym go wypełnić na
ekranie 2×.

## Czerń i biel na okładkach wpisów

Okładki wpisów są domyślnie **czarno-białe** i wracają do koloru pod kursorem. Robi to
atrybut `data-photo-tone` (reguła w `global.css`), nałożony na okładki w trzech miejscach:
kafle na `/blog`, „Ostatnie artykuły" na stronie głównej i „Czytaj dalej" pod wpisem.
Przejście trwa 700 ms.

Rozjaśnianie do koloru siedzi w `@media (hover: hover)` i jest podpięte pod `:hover`
oraz `:focus-visible` **linku**, nie samego zdjęcia — cały kafel jest jednym `<a>`,
więc kolor wraca niezależnie od tego, czy kursor stoi na zdjęciu, czy na tytule.

Na dotyku hoveru nie ma, więc rolę wyzwalacza bierze **wjazd w kadr**: `initPhotoTone`
w `animacje.js` tworzy dla każdej okładki ScrollTrigger i ustawia na niej
`data-in-view`, a reguła w `@media (hover: none)` koloruje te z wartością `true`.
Zakres domyślny: `top 85%` do `bottom 15%`, czyli kolor trzyma się, dopóki zdjęcie jest
wyraźnie w kadrze, a po wyjściu wraca czerń i biel. Nadpisać można z markupu przez
`data-tone-start` i `data-tone-end`.

Atrybut ustawia się na każdej szerokości ekranu (to tylko zapis w DOM, kilka
ScrollTriggerów), a o tym, czy cokolwiek widać, decyduje media query. Dzięki temu
nie trzeba nic reinicjalizować, gdy urządzenie ma i kursor, i dotyk.

⚠️ Nie realizuj tego klasami Tailwinda (`grayscale` + `group-hover:grayscale-0`).
Obie ustawiają tę samą właściwość, więc o wyniku decyduje kolejność w arkuszu, a nie
kolejność klas w atrybucie — ta sama pułapka, która jest opisana przy podświetlaniu
wiersza formularza w `animacje.md`.

Zdjęcia nieklikalne (hero na podstronach, okładka wewnątrz wpisu, zdjęcia w sekcjach
o firmie) zostały w kolorze — nie mają czego hoverować.

## Poprzednie zestawy

`src/assets/stock/` (sesja stockowa, dziesięć plików) i luźne pliki w `src/assets/`
(`office-interior.jpg`, `writing-calculator.jpg`, `calculator-notebook.jpg`,
`handshake-documents.jpg`, `documents-stack.jpg`, `accounting-documents.jpg`,
`planner-desk.jpg`, `laptop-invoice.jpg`) nie są już przez nic importowane, więc
**nie trafiają do `dist/`** — Astro pakuje tylko zaimportowane zasoby.

Zostają w repo jako zapas na wypadek, gdyby któryś kadr własnej sesji okazał się nie do
użycia. Jeżeli po kilku tygodniach nic z nich nie wróci, można usunąć razem
z `public/stock/`.
