# Zdjęcia na stronie

Pliki źródłowe leżą w `src/assets/` (sesja stockowa w `src/assets/stock/`). Wchodzą
przez `astro:assets` (`<Image>`), więc Astro sama robi z nich WebP i warianty
szerokości — w repo trzymamy tylko oryginał.

Kopie nieprzeskalowane, wprost od dostawcy, leżą w `public/stock/`. **To materiał
źródłowy, nie zasób strony:** pliki w `public/` idą do `dist/` jeden do jednego, a te
mają po 3-10 MB (razem ~45 MB). Do wyświetlania służą wyłącznie te z `src/assets/stock/`,
przeskalowane do 2000 px (~140-260 KB), czyli do tej samej skali, co pozostałe zdjęcia
w projekcie. Największy wariant, jaki wydaje `<Image>`, ma 1600 px, więc 2000 px
zostawia zapas.

## Licencja

⚠️ **DO UZUPEŁNIENIA.** Zdjęcia z `stock/` przyszły jako gotowy zbiór plików, bez
informacji o pochodzeniu. Nazwy plików (`front-view-people-having-meeting-office`,
`beautiful-business-woman-office`) wyglądają na konwencję jednego z dużych serwisów
stockowych, ale **zgadywanie autora i licencji byłoby tu wpisaniem nieprawdy**.
Trzeba dopisać: serwis, adres oryginału i warunki licencji — a przy zdjęciach
z ludźmi także to, czy licencja obejmuje zgodę modela na użycie komercyjne
(większość serwisów wymaga tego osobno, tzw. model release).

Wcześniejszy zestaw pochodził z [Pexels](https://www.pexels.com/license/) i ten wpis
opisywał licencję imiennie, z autorem każdego pliku. Do tego stanu warto wrócić.

## Dobór

**Zmiana względem poprzedniego zestawu: teraz na zdjęciach SĄ ludzie, z twarzami.**
Poprzedni dobór świadomie ich unikał (kadry na dokumentach, biurku, kalkulatorze),
bo strona nie ma przy zdjęciach podpisów, więc osoba na zdjęciu czyta się jak
pracownik biura albo klient, a nie jest ani jednym, ani drugim. Ta decyzja została
zmieniona wprost — zestaw jest z sesji z ludźmi w biurze.

Warto o tym pamiętać przy dwóch rzeczach: przy licencji (patrz wyżej: model release)
i przy podstronie o zespole — dziewięć kafelków „nasi specjaliści" nadal wymaga zdjęć
PRAWDZIWYCH osób, bo stoją przy imionach i rolach. Zdjęcia stockowe w tym miejscu
byłyby wprowadzaniem w błąd, a nie ilustracją.

## Spis

Wszystkie na stronie głównej. Kolejność jak na stronie, z góry na dół.

| Plik (`src/assets/stock/`) | Miejsce na stronie | Plik źródłowy w `public/stock/` |
| --- | --- | --- |
| `two-business-partners-office.jpg` | hero, zdjęcie przy napisie MAZUR | `two-business-partners-working-together-office.jpg` |
| `people-having-meeting-office.jpg` | wiersz trzech zdjęć, kolumna 1 (wyższa) | `front-view-people-having-meeting-office.jpg` |
| `business-woman-writing-notes.jpg` | wiersz trzech zdjęć, kolumna 2 | `beautiful-business-woman-office (1).jpg` |
| `female-work-brainstorming.jpg` | wiersz trzech zdjęć, kolumna 3 (pod akapitem o usługach) | `female-work-brainstorming.jpg` |
| `young-woman-at-computer.jpg` | sekcja FAQ (widoczna od `lg`) | `young-woman-work-office-using-computer-graphic-tablet.jpg` |
| `professional-woman-at-work.jpg` | blog, „Zmiany w składce zdrowotnej od 2026 roku" | `front-view-professional-woman-work.jpg` |
| `group-working-out-business-plan.jpg` | blog, „Jak przygotować firmę do zamknięcia roku" | `group-people-working-out-business-plan-office.jpg` |
| `business-woman-laptop-documents.jpg` | blog, „KSeF w praktyce" | `beautiful-business-woman-office.jpg` |

| `business-woman-desk-wide.jpg` | `uslugi`, kadr powitalny pod karuzelą napisu | trzeci kadr z tej samej sesji, co dwa użyte |
| `elegant-business-lady-office.jpg` | `o-nas`, kadr powitalny pod karuzelą napisu | — |
| `young-woman-at-computer.jpg` | `kontakt`, kadr 3:4 w karcie formularza — drugie użycie tego pliku, obok sekcji FAQ na stronie głównej | — |

Nieużytych plików w `src/assets/stock/` już nie ma.

## Kadrowanie

Każde zdjęcie ma parallax (`.parallax-img` + `data-parallax`, opis w `animacje.md`),
czyli **kadr pokazuje pas zdjęcia, który przesuwa się przy przewijaniu** — raz wyżej,
raz niżej. Dlatego przy podmianie zdjęcia nie wystarczy, że dobrze wygląda w spoczynku:
sprawdź je też w chwili wjazdu w kadr, bo wtedy kadr stoi najniżej i to wtedy ścina
czubki głów. Siłę ruchu reguluje jedna liczba (`--parallax`, domyślnie 6%).

Zdjęcia w tym zestawie są kadrowane ciasno i wszystkie mają proporcje 3:2, a kadry na
stronie są od 2,28:1 (hero) do 3:4 (FAQ) — czyli wycinają z nich bardzo różne fragmenty.
Do kadru pionowego (FAQ) i kwadratowego (kolumna 1) trafiły więc zdjęcia z tematem
POŚRODKU, bo `object-cover` obcina tam boki.

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

## Poprzedni zestaw

Pliki z pierwszego doboru zostają w `src/assets/` (`office-interior.jpg`,
`writing-calculator.jpg`, `calculator-notebook.jpg`, `handshake-documents.jpg`,
`documents-stack.jpg`, `accounting-documents.jpg`, `planner-desk.jpg`,
`laptop-invoice.jpg`). Nic ich już nie importuje, więc **nie trafiają do `dist/`** —
Astro pakuje tylko zaimportowane zasoby. Jeśli nie wrócą, można je usunąć.
