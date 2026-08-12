# Kolory

> Jedno miejsce, z którego przemalowuje się całą stronę.

## Gdzie zmieniać

Blok `@theme static` na początku **`src/styles/global.css`** (linie 9–20).
To jedyne miejsce w projekcie, w którym zapisane są wartości kolorów. Nigdzie
w `.astro`, `.js` ani w dalszej części `global.css` nie ma już surowego hexa.

```css
@theme static {
  --color-canvas: #ebeee5;
  --color-canvas-deep: #d7eec6;
  --color-ink: #1b1710;
  --color-graphite: #2b3637;
  --color-placeholder: #dbe1ea;
  --color-alert: #ff4b3e;
  --color-grid: rgba(255, 255, 255, 0.7);
  --color-white: #ffffff;
  --color-black: #000000;

  --shadow-lift: 0 10px 30px color-mix(in srgb, var(--color-ink) 32%, transparent);
  --shadow-panel: 0 18px 50px color-mix(in srgb, var(--color-ink) 30%, transparent);
}
```

Zmiana jednej wartości przemalowuje wszystkie miejsca, które z niej korzystają —
razem z przezroczystymi wariantami (`text-canvas/55`) i z cieniami, bo one liczą
się z `--color-ink` przez `color-mix`.

## Tokeny

| Token | Klasy | Gdzie działa |
| --- | --- | --- |
| `--color-canvas` | `bg-canvas`, `text-canvas`, `border-canvas` | tło strony; jasny tekst, obramowania i wypełnienia na ciemnych panelach (menu, czat, formularz, stopka) |
| `--color-canvas-deep` | `bg-canvas-deep` | głębszy odcień tła: pierwsza warstwa kurtyny przejścia między podstronami i wyróżniona karta na głównej |
| `--color-ink` | `bg-ink`, `text-ink`, `border-ink` | ciemne panele i sekcje, tło buttonów CTA, mocny tekst, kropka scrollbara, wypełnienie autofill |
| `--color-graphite` | `text-graphite`, `border-graphite` | podstawowy tekst treści i cienkie linie rozdzielające na jasnym tle |
| `--color-forest` | `bg-forest` | ciemnozielone kółko własnego kursora nad kaflami wpisów (napis „Zobacz") |
| `--color-placeholder` | `bg-placeholder` | tło kadru zdjęcia, widoczne dopóki obraz się nie wczyta lub nie odsłoni |
| `--color-alert` | `bg-alert` | kropka nieprzeczytanej wiadomości na przycisku czatu |
| `--color-grid` | — | linie siatki w tle `body` (rysowane gradientem, nie klasą) |
| `--color-white` | `bg-white` | wypełnienie paska postępu scrolla i tło pigułki kontaktowej pod kursorem |
| `--color-black` | `bg-black` | dwie połowy kurtyny ekranu ładowania |
| `--shadow-lift` | `shadow-lift` | unoszące się elementy: przycisk czatu, pigułka kontaktowa |
| `--shadow-panel` | `shadow-panel` | panel okna czatu |

`--color-white` i `--color-black` nadpisują wbudowane kolory Tailwinda o tych nazwach.
Wartości są te same co domyślne, ale dzięki temu leżą w tym samym bloku co reszta
palety i też można je stąd zmienić.

Domyślny kolor tekstu całej strony ustawia `text-graphite` na `<body>`
(`src/layouts/BaseLayout.astro`). Wcześniej było tam `text-slate-900` z domyślnej
palety Tailwinda, czyli kolor spoza tej listy.

Wariant przezroczysty dopisuje się ukośnikiem: `text-canvas/55`, `border-ink/15`,
`bg-graphite/40`. Tailwind liczy to przez `color-mix` na tokenie, więc podąża
za zmianą wartości.

## Zmienne pochodne

Definiowane dalej w `global.css`, wyliczone z tokenów — zwykle nie ma potrzeby
ich ruszać:

| Zmienna | Wartość | Rola |
| --- | --- | --- |
| `--page-background` | `var(--color-canvas)` | tło `body` oraz klasy `bg-[var(--page-background)]` na panelach `reveal-panel`, które muszą zniknąć w tle |
| `--grid-color` | `var(--color-grid)` | kolor linii siatki |
| `--scrollbar-track` / `--scrollbar-thumb` | `--color-canvas` / `--color-ink` | scrollbar; na ciemnych panelach (`[data-form-panel]`, `[data-chat-scroll]`) i przy zablokowanym scrollu Lenisa nadpisywane na odwrotne |

## Kolory w JavaScripcie

`src/scripts/animations.js` nie trzyma wartości kolorów. GSAP potrzebuje
konkretnej wartości do animowania, więc czyta ją z tokenu:

```js
const colorToken = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
```

Użycie: ikona na pasku postępu przechodzi z `colorToken('--color-canvas')`
na `colorToken('--color-ink')`.

## Czego tokeny nie obejmują

- **`public/favicon.svg`** — ma własne `#000` / `#FFF` i przełącznik jasny/ciemny.
  Osobny plik, nie widzi zmiennych strony. Zmiana palety nie rusza favicony.
- **Zdjęcia i logo klientów** — kolory logo są korygowane filtrami
  (`.logo-silver`, `.logo-graphite` w `global.css`), nie tokenami.

## Zasada

Nowy kolor w markupie = najpierw token w `@theme static`, potem klasa z jego
nazwą. Nie wpisuj hexa wprost w klasę (`bg-` + nawias kwadratowy z wartością) —
po takim zapisie kolor przestaje być sterowalny z jednego miejsca. Nazwy tokenów
po angielsku (patrz `CLAUDE.md`).

Uwaga przy pisaniu dokumentacji: Tailwind skanuje też pliki `.md`, więc przykład
klasy z hexem wpisany w dokumentację wygeneruje w arkuszu martwą regułę
z zapisanym na twardo kolorem. Dlatego takie przykłady opisujemy słowami.
