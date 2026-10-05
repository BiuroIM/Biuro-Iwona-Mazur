# Biuro Rachunkowe Iwona Mazur: strona internetowa

Strona firmowa biura rachunkowego z Dębicy: strona główna, O nas, Usługi, Blog, Kontakt,
polityka prywatności oraz panel wpisów dla pracowników (`/panel`).

Zacznij od tego pliku. Szczegóły poszczególnych mechanizmów są w osobnych plikach `.md`,
wypisanych w sekcji [Dokumentacja](#dokumentacja).

## Technologia

| Co | Czym |
| --- | --- |
| Generator strony | [Astro](https://docs.astro.build) 7, strona w pełni statyczna (`dist/` to gotowe pliki HTML) |
| Style | Tailwind CSS 4, kolory w `src/styles/global.css` |
| Animacje | GSAP + ScrollTrigger, płynne przewijanie Lenis |
| Panel wpisów | React, osadzony w `src/pages/panel.astro` |
| Baza danych | Supabase: wpisy z panelu i zgłoszenia z formularza (`supabase/schema.sql`) |
| Czcionki | Satoshi i Clash Grotesk (Fontshare), Poppins (Google), pobierane przy buildzie |

## Pierwsze uruchomienie

Wymagany **Node.js 22.12 lub nowszy**.

```sh
npm ci
cp .env.example .env
npm run dev
```

Strona działa pod `http://localhost:4321`.

W `.env` trzeba wpisać prawdziwe `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY`
(Supabase → Project Settings → API). Bez nich strona się zbuduje, ale formularz
kontaktowy i panel wpisów nie będą działać. Plik `.env` jest w `.gitignore`
i nie trafia do repozytorium.

## Komendy

| Komenda | Co robi |
| --- | --- |
| `npm run dev` | serwer deweloperski z podglądem na żywo |
| `npm run build` | buduje gotową stronę do katalogu `dist/` |
| `npm run preview` | podgląd zbudowanej strony z `dist/` |
| `npm run sync:blog` | pobiera wpisy opublikowane w panelu z Supabase i zapisuje je jako pliki `.md` |
| `npm run publish` | wysyłka przez FTP z tymczasowego wariantu wdrożenia; nieużywana, do decyzji przy nowym wdrożeniu |

## Wdrożenie

Docelowy sposób wdrożenia na serwer jest **do ustalenia**. Automatyczny deploy na home.pl
był tymczasowy i został usunięty 30.09.2026. Wpisy dodane w panelu zapisują się w Supabase,
ale nie pojawiają się na stronie.

Chwilowy podgląd: każdy push na `main` buduje stronę i publikuje ją na GitHub Pages
(`.github/workflows/preview.yml`) pod adresem https://biuroim.github.io/Biuro-Iwona-Mazur/.
Strona działa tam w podkatalogu, więc build dostaje `BASE_PATH`, a workflow dopisuje
prefiks do linków zaczynających się od `/`. Podgląd nie pobiera wpisów z panelu.

## Struktura projektu

```
src/
  pages/          podstrony, jedna na plik (index.astro = strona główna)
    blog/[slug]   szablon pojedynczego wpisu
  layouts/        BaseLayout.astro: <head>, meta, dane strukturalne, wspólny szkielet
  components/     nagłówek, menu, stopka, formularz, slidery, czat
    panel/        aplikacja panelu wpisów (React)
  content/blog/   wpisy na bloga w Markdownie
  data/           dane i teksty używane w wielu miejscach
  scripts/
    animations.js       rejestr animacji, ładowany na każdej podstronie
    animations/         poszczególne efekty
  styles/global.css     kolory, czcionki, style bazowe
  assets/         zdjęcia przetwarzane przez Astro (WebP, warianty szerokości)
  lib/            klient Supabase i pomocnicze funkcje panelu
public/           pliki kopiowane bez zmian: favicony, logo, obraz Open Graph, robots.txt
scripts/          skrypty Node: pobieranie wpisów z panelu
supabase/         schemat bazy i uprawnień
```

## Gdzie co zmienić

| Chcę zmienić | Plik |
| --- | --- |
| telefon, e‑mail, adres, godziny otwarcia, NIP, KRS | `src/data/contact.js` |
| obietnicę „zadzwonimy w ciągu…” | `src/data/contact.js`, pole `callback` |
| pozycje w menu i w stopce | `src/data/navigation.js` |
| pytania w czacie i FAQ | `src/data/questions.js` |
| kolory całej strony | `src/styles/global.css`, blok `@theme static` (patrz `KOLORY.md`) |
| teksty na podstronie | plik podstrony w `src/pages/` |
| wpis na blogu | panel `/panel` albo plik w `src/content/blog/` (patrz `BLOG.md`) |
| zdjęcie | `src/assets/photos/` + import w podstronie (patrz `ZDJECIA.md`) |
| tytuł i opis strony dla Google | atrybuty `title` i `description` przy `<BaseLayout>` w pliku podstrony |

## Zasady pisania kodu

Obowiązują bez wyjątków. Pełna wersja z uzasadnieniem jest w `CLAUDE.md` (tę samą treść
ma `AGENTS.md`; oba pliki czytają też asystenci AI).

1. **Zero komentarzy w kodzie.** Ani `//`, ani `/* */`, ani `<!-- -->`. Jeżeli decyzja
   wymaga wyjaśnienia, zapisz je w odpowiednim pliku `.md`.
2. **Kod tylko po angielsku.** Zmienne, funkcje, klasy CSS, zmienne CSS, atrybuty `data-*`
   i nazwy plików. Polski zostaje wyłącznie w treściach widocznych na stronie
   (napisy, `alt`, `aria-label`, teksty w `src/data/`) i w plikach `.md`.
3. **Desktop first.** Style bazowe są dla dużego ekranu, węższe nadpisują warianty
   `max-lg:`, `max-md:`, `max-sm:`.
4. **Rozmiary płynne.** Wielkości w `vw` i `clamp()`, nie w stałych pikselach.
5. **Animacje przez GSAP i ScrollTrigger** w `src/scripts/animations/`, uruchamiane
   atrybutami `data-*` w HTML. Bez `IntersectionObserver`.
6. **Bez efektów hover**, o ile nie ma na nie wyraźnego zamówienia.
7. **Kolory tylko z tokenów** (`text-graphite`, `bg-canvas`…), bez wpisywania wartości
   `#…` w komponentach. Czerń (`ink`) tylko dla gigantycznej typografii, nagłówki
   i hasła w `graphite`.
8. **Treści na stronie bez myślników**: zdania rozdziela się kropką albo dwukropkiem.

## Dokumentacja

| Plik | Czego dotyczy |
| --- | --- |
| `animacje.md` | jak działają animacje, lista atrybutów `data-*` i ich parametrów |
| `BLOG.md` | skąd biorą się wpisy, pola wpisu, jak dodać wpis ręcznie |
| `PANEL.md` | panel wpisów dla pracowników: logowanie, Supabase, publikacja |
| `FORMULARZ.md` | formularz kontaktowy i powiadomienia na Microsoft Teams |
| `KOLORY.md` | paleta i przemalowanie strony |
| `ZDJECIA.md` | skąd są zdjęcia, gdzie które jest użyte, jak dodać nowe |
| `biuro-mazur-teksty-strony.md` | źródłowe teksty wszystkich podstron |
| `PRZED_PUBLIKACJA.md` | lista rzeczy do domknięcia przed startem strony |
| `do_zrobienia.md` | dług techniczny do spłacenia w przyszłości |
| `CLAUDE.md` / `AGENTS.md` | zasady pisania kodu i instrukcje dla asystentów AI |
