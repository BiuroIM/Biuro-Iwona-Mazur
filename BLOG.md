# Blog

> Skąd biorą się wpisy i jak dodać nowy.

## Gdzie co leży

| Plik | Rola |
| --- | --- |
| `src/content/blog/*.md` | treść wpisów. Jeden plik = jeden wpis |
| `src/content.config.mjs` | schemat pól we frontmatterze. Astro sprawdza go przy buildzie |
| `src/data/blog.js` | sortowanie, format daty, wybór wyróżnionego, powiązane wpisy |
| `src/pages/blog.astro` | lista wpisów pod `/blog` |
| `src/pages/blog/[slug].astro` | pojedynczy wpis pod `/blog/nazwa-pliku` |
| `.post-body` w `global.css` | typografia treści wpisu |

Adres wpisu bierze się z **nazwy pliku**. `ksef-w-praktyce.md` daje `/blog/ksef-w-praktyce`.
Zmiana nazwy pliku zmienia adres, więc po publikacji lepiej jej nie ruszać.

## Dwie drogi dodania wpisu

**Ręcznie**, plikiem `.md`, jak niżej. Tak powstało siedem wpisów, które są w repo teraz.

**Z panelu** pod `/panel`, gdzie piszą pracownicy biura bez dostępu do kodu. Wpisy z panelu
też kończą jako pliki `.md` w tym katalogu, tylko generuje je `scripts/sync-blog.mjs`
przy buildzie. Opis całego mechanizmu: `PANEL.md`.

Pliki wygenerowane z panelu są wymienione w `scripts/generated-posts.json` i **tylko one**
są nadpisywane przy synchronizacji. Wpisy pisane ręcznie są nietykalne: przy konflikcie
adresów build zatrzymuje się z komunikatem, zamiast nadpisać treść.

## Jak dodać wpis ręcznie

Nowy plik `.md` w `src/content/blog/` z takim frontmatterem:

```markdown
---
title: 'Tytuł wpisu'
lead: 'Jedno albo dwa zdania wprowadzenia. Widać je na liście i pod tytułem wpisu.'
date: 2026-08-05
category: 'Podatki'
readingMinutes: 6
cover: '../../assets/stock/nazwa-zdjecia.jpg'
coverAlt: 'Opis zdjęcia dla czytników ekranu'
softParallax: true
featured: false
---

Treść wpisu w Markdownie.

## Nagłówek sekcji

Akapit, **pogrubienie**, listy punktowane i numerowane.
```

### Pola

| Pole | Wymagane | Uwagi |
| --- | --- | --- |
| `title` | tak | pełny tytuł. Trafia też do `<title>` strony |
| `lead` | tak | wprowadzenie. Trafia do opisu w wynikach wyszukiwania |
| `date` | tak | format `RRRR-MM-DD`. Steruje kolejnością, najnowsze u góry |
| `category` | tak | dowolny tekst. Zestawienie kategorii z licznikami powstaje samo |
| `readingMinutes` | tak | liczba minut. Wpisywana ręcznie |
| `cover` | tak | ścieżka do zdjęcia względem pliku wpisu |
| `coverAlt` | tak | opis zdjęcia |
| `softParallax` | nie | `true` daje łagodniejszy parallax. Domyślnie `false` |
| `featured` | nie | `true` wyciąga wpis na górę `/blog` jako wyróżniony |

Literówka w nazwie pola albo brak wymaganego pola zatrzymuje build z komunikatem,
który wskazuje plik i pole. To celowe: lepiej złapać to przy buildzie niż na produkcji.

## Serwer dev a kolekcje

Astro czyta `src/content.config.mjs` **tylko przy starcie serwera dev**. Dodanie
nowej kolekcji przy działającym serwerze kończy się błędem 500 na stronie, która
z niej czyta, choć `astro build` przechodzi bez problemu. Wtedy wystarczy restart:

```
astro dev stop
astro dev --background
```

Dopisanie kolejnego pliku `.md` do **istniejącej** kolekcji restartu nie wymaga,
serwer podłapuje go sam.

## Jak zbudowana jest lista pod `/blog`

Dwie części, w tej kolejności:

1. **Taśma „Blog"** — ta sama co na pozostałych podstronach.
2. **Dwie kolumny kafli** — wszystkie wpisy, najnowsze pierwsze. Kafel to zaokrąglona
   okładka `3/2` (z kurtyną `data-image-reveal` i parallaxem), pod nią data poprzedzona
   zamalowaną kropką w kolorze `ink`, a pod datą tytuł w Clash Display. Nic więcej:
   bez leadu, bez czasu czytania, bez kategorii. Na `max-sm` kolumny schodzą do jednej.

Po kaflach zostaje przyklejona sekcja CTA („Masz pytanie?"), wspólna z pozostałymi
podstronami.

**Ten sam kafel jest w trzech miejscach** i ma wszędzie tę samą anatomię: okładka `3/2`,
kropka `ink` z datą w formacie `formatDateMonthFirst`, tytuł w Clash Display wersalikami.
Poza `/blog` są to „Ostatnie artykuły" na stronie głównej i „Czytaj dalej" pod wpisem —
tam kolumny są trzy, a nie dwie, bo to sekcje uzupełniające, nie właściwa lista.
Zmieniając wygląd kafla, zmień go we wszystkich trzech plikach.

Każdy kafel niesie `data-cursor-label="Zobacz"` (ciemnozielone kółko zamiast kursora,
opis w `animacje.md`) i `data-photo-zoom` na okładce (przybliżenie pod kursorem, opis w `ZDJECIA.md`).

**Data w kaflach ma inny format niż w artykule.** Kafle używają `formatDateMonthFirst`
(`Sierpień 8 2026`), a nagłówek wpisu `formatDate` (`8 sierpnia 2026`). Dwa formatery,
bo `Intl` z `month: 'long'` daje mianownik tylko wtedy, gdy formatuje sam miesiąc —
w zestawieniu z dniem przechodzi w dopełniacz („sierpnia").

**Wyróżniony wpis nie ma teraz znaczenia na liście.** `featured: true` wpływa wyłącznie
na to, co pokazuje `splitFeatured`, a lista pod `/blog` bierze wszystkie wpisy po kolei.
`countByCategory` też nie jest nigdzie wołane — zostaje jako gotowy pomocnik, gdyby
wróciły kategorie albo filtr.

## Zasady, o których łatwo zapomnieć

**Jeden wyróżniony wpis.** `featured: true` ustawiaj tylko w jednym pliku. Gdy jest
w kilku, wygrywa najnowszy. Gdy nie ma go nigdzie, wyróżniony zostaje najnowszy wpis.

**Zdjęcia z `src/assets/`, nie z `public/`.** Tylko wtedy Astro robi z nich webp
w kilku rozmiarach. Zdjęcie z `public/` przejdzie, ale pójdzie na stronę bez obróbki.

**Data w przyszłości też się opublikuje.** Nie ma mechanizmu wpisów zaplanowanych.
Wpis pojawia się na stronie od razu po buildzie.

**Spis treści powstaje z nagłówków `##`.** Nagłówki `###` się w nim nie pokazują.
Wpis bez żadnego `##` po prostu nie ma spisu treści i to jest w porządku.

## Co robi `src/data/blog.js`

Pomocniki wołane z obu stron bloga i ze strony głównej, żeby ta sama logika nie
powtarzała się w trzech miejscach:

- `sortPosts` — najnowsze pierwsze,
- `splitFeatured` — rozdziela wyróżniony wpis od pozostałych,
- `formatDate` i `isoDate` — data po polsku do wyświetlenia oraz format maszynowy do `<time datetime>`,
- `readingLabel` — podpis z czasem czytania,
- `countByCategory` — kategorie z licznikami, napędza filtr nad indeksem wpisów. Liczymy
  na `rest`, nie na `posts`, żeby licznik zgadzał się z liczbą wierszy, które filtr pokaże
  (wyróżniony wpis stoi osobno nad listą i nie bierze udziału w filtrowaniu),
- `relatedPosts` — sekcja „Czytaj dalej", najpierw z tej samej kategorii, potem uzupełnienie najnowszymi.

## Powiązania z resztą strony

Sekcja „Ostatnie artykuły" na stronie głównej czyta **tę samą kolekcję** i pokazuje
trzy najnowsze wpisy. Nie ma osobnej listy artykułów w `index.astro`, więc nowy wpis
pojawia się na głównej sam.

Pozycja „blog" w nawigacji jest w `src/data/navigation.js` i wskazuje `/blog`.

## Treść, która jest w plikach teraz

Siedem wpisów napisanych jako punkt wyjścia do podmiany. Są **bez konkretnych stawek,
progów i terminów**, bo te zmieniają się w trakcie roku i wymagają sprawdzenia
w aktualnym stanie przepisów. Jeżeli dopisujesz liczby, dopisz też przy nich rok,
za który obowiązują.
