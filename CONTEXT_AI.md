# CONTEXT_AI.md

> Plik kontekstowy dla AI (Claude Code) i dla nas. Zbiera kluczowe decyzje
> dotyczące projektu, żeby nie trzeba było ich za każdym razem powtarzać.
> **Aktualizować przy każdej istotnej zmianie kierunku.**

## Projekt

Strona internetowa dla **Biura Rachunkowego Iwona Mazur**. Cel: nowoczesna,
mocno animowana strona firmowa z bardzo dobrym SEO (renderowana do HTML).

**Wygląd** budujemy krok po kroku na podstawie **projektu z Figmy**
(istnieje wstępny projekt).

## Priorytety

1. **SEO** — strona ma być renderowana do statycznego HTML, treść widoczna
   dla Google od razu.
2. **Animacje** — dużo animacji, głównie:
   - `onScroll` (reveal przy scrollu, efekt scrub — np. animacja przywiązana
     do pozycji scrolla, „50% sekcji → 50% animacji"),
   - `onHover`,
   - czasem `onClick`,
   - płynne przejścia między podstronami.
3. **Wydajność** — dobre Core Web Vitals (istotne dla rankingu w Google).

## Stack technologiczny (ZATWIERDZONY)

| Warstwa | Technologia | Po co |
|---|---|---|
| Framework | **Astro** | Statyczny HTML → idealne SEO |
| Interaktywność | **React (wyspy / islands)** | Tylko punktowo, tam gdzie realnie potrzeba |
| Animacje scroll/hero | **GSAP + ScrollTrigger** | Reveal, scrub, parallax, hover |
| Smooth scroll | **Lenis** | Zsynchronizowany z ScrollTrigger w `scripts/animacje.js` |
| Przejścia stron | **Astro View Transitions** | Płynne przejścia między podstronami |
| Style | **Tailwind CSS** | Zatwierdzone |
| Fonty | **Satoshi** + **Clash Grotesk** (Fontshare) | Self-hosted przez Astro Fonts API |
| SEO | `@astrojs/sitemap` + meta/OG + JSON-LD | Sitemap, meta tagi, dane strukturalne `LocalBusiness` |
| Panel wpisów | **Supabase** (Auth, baza, Storage) + **GitHub Actions** → FTP na home.pl | Pracownicy piszą wpisy pod `/panel`, build wypycha stronę na hosting. Opis: `PANEL.md` |

**Zasada React:** React używamy tylko punktowo (wyspy). Większość strony to
Astro + GSAP. Nie ładujemy React na całą stronę.

## Struktura plików (docelowa)

```
src/
  layouts/
    BaseLayout.astro        → <head>, SEO, View Transitions, navbar, stopka
  components/
    Naglowek.astro          → menu / navbar, animowane
    Stopka.astro
    Hero.astro              → animacja GSAP przy wejściu
    SekcjaScroll.astro      → reużywalna sekcja z reveal onScroll
    Liczniki.astro          → animowane liczniki
    KartaUslugi.astro
    FormularzKontaktowy.jsx  → React (wyspa) — NA RAZIE POMIJAMY BACKEND
  pages/
    index.astro
    (kolejne podstrony — struktura do ustalenia później)
  scripts/
    animacje.js             → globalna konfiguracja GSAP/ScrollTrigger
  styles/
    global.css
public/
    (obrazy, logo, favicon)
```

## Paleta kolorów

**Jedyne miejsce, gdzie zapisane są wartości kolorów, to blok `@theme static`
na początku `src/styles/global.css`.** Zmiana wartości tam przemalowuje całą stronę.
Pełny opis tokenów: `KOLORY.md`.

| Token | Klasy Tailwinda | Rola |
| --- | --- | --- |
| `--color-canvas` | `bg-canvas`, `text-canvas`, `border-canvas` | tło strony i jasny tekst na ciemnych panelach |
| `--color-canvas-deep` | `bg-canvas-deep` | głębszy odcień tła (kurtyna przejścia, karta wyróżniona) |
| `--color-ink` | `bg-ink`, `text-ink`, `border-ink` | ciemne panele, mocny tekst, tło buttona |
| `--color-graphite` | `text-graphite`, `border-graphite` | podstawowy tekst treści |
| `--color-placeholder` | `bg-placeholder` | tło kadru zdjęcia, dopóki obraz się nie pokaże |
| `--color-alert` | `bg-alert` | kropka powiadomienia na czacie |
| `--color-grid` | — | linie siatki w tle `body` |

- W kodzie nie ma już hexów wpisanych wprost — ani w klasach Tailwinda, ani w `.astro`,
  `.css`, `.js`. Wyłącznie nazwy tokenów.
- Uwaga: karuzela logo ma tło `bg-canvas`, bo `mix-blend-multiply` liczy się
  względem tła w tym samym kontekście — musi zgadzać się z tłem strony.

## Podstrony

| Adres | Plik | Uwagi |
| --- | --- | --- |
| `/` | `pages/index.astro` | strona główna |
| `/o-nas` | `pages/o-nas.astro` | |
| `/uslugi` | `pages/uslugi.astro` | |
| `/blog` | `pages/blog.astro` | lista wpisów, wyróżniony wpis, kategorie z licznikami |
| `/blog/nazwa-wpisu` | `pages/blog/[slug].astro` | generowane z kolekcji `blog`. Opis: `BLOG.md` |
| `/kontakt` | `pages/kontakt.astro` | |
| `/panel` | `pages/panel.astro` | panel wpisów dla pracowników. Poza `BaseLayout`, `noindex`, poza sitemapą. Opis: `PANEL.md` |

Treść wpisów bloga to content collection w `src/content/blog/` (schemat
w `src/content.config.mjs`). Sekcja „Ostatnie artykuły" na stronie głównej czyta
tę samą kolekcję, więc nie ma drugiej listy artykułów do utrzymania.

Nawigacja ma jedno źródło prawdy: `src/data/navigation.js`.

## Elementy współdzielone (WAŻNE)

**Navbar, stopka i kilka innych elementów muszą być przypięte na KAŻDEJ
podstronie.** Realizacja przez `BaseLayout.astro` (wspólny layout owijający
wszystkie strony).

## Kolejność budowy (USTALONA)

1. **Strona główna** — zaczynamy od niej (najpierw sam wygląd).
2. Navbar dla każdej strony.
3. Stopka (footer).
4. Pozostałe wspólne elementy.
5. Reszta podstron.
6. Później: formularz kontaktowy (obecnie tylko wygląd), SEO/JSON-LD, dopracowanie.

## Decyzje otwarte / odłożone

- **Struktura podstron** — jeszcze do dopracowania, na razie pomijamy.
- **Formularz kontaktowy** — NA RAZIE nigdzie nie wysyła. Najpierw budujemy
  sam wygląd. Backend/wysyłkę ustalimy później (Astro jest statyczne, więc
  wysyłka wymaga usługi zewnętrznej typu Formspree / Resend).

## Zasady dot. animacji i dostępności

- Treść zawsze w HTML (dla SEO) — animacja tylko ją odsłania, nie generuje.
- **`prefers-reduced-motion`: NIE respektujemy** — decyzja użytkownika z
  2026-07-24. Animacje (Lenis smooth scroll + reveal) wymuszamy zawsze,
  niezależnie od ustawienia systemowego. Uzasadnienie: strona z założenia jest
  mocno animowana. (Uwaga: animacje *przejść między podstronami* z Astro
  ClientRouter i tak bywają wyłączane przez samą przeglądarkę pod
  reduced-motion — tego nie da się prosto obejść, ale to osobny temat.)
- Preferować globalny, reużywalny mechanizm animacji (np. atrybut
  `data-animate="fade-up"`) zamiast pisać animacje od zera w każdym miejscu.
