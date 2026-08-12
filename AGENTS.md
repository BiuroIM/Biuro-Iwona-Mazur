## ZASADY PISANIA KODU W TYM PROJEKCIE (czytaj przed każdą zmianą)

### 1. ZERO KOMENTARZY W KODZIE

**Nie dopisuj komentarzy.** Ani `//`, ani `/* */`, ani `<!-- -->`, ani `{/* */}` —
niezależnie od tego, jak nieoczywista wydaje się dana linia. Kod ma tłumaczyć się sam:
nazwą zmiennej, nazwą klasy, kształtem funkcji.

Dotyczy to również:
- „krótkiego wyjaśnienia na jedno zdanie",
- ostrzeżeń typu „⚠️ nie zmieniaj tego, bo…",
- notatek o zmierzonych wartościach i o tym, dlaczego wybrano taką liczbę,
- opisu, co było tu wcześniej i dlaczego zostało zmienione,
- komentarza na końcu linii po średniku.

Jeżeli jakaś decyzja naprawdę wymaga uzasadnienia, jego miejscem jest plik `.md`
(`animacje.md` dla mechanizmów animacji, `ZDJECIA.md` dla zdjęć, ten plik dla zasad) —
**nigdy plik z kodem**. Odpowiadając użytkownikowi, wyjaśnienia podawaj w wiadomości,
nie w kodzie.

Historia tej zasady: w kodzie narosło ponad 3200 linii komentarzy i zostały usunięte
w całości na wyraźne polecenie. Nie odbudowuj ich.

### 2. Nazwy w kodzie — ZAKAZ POLSKIEGO

**Wszystko, co jest kodem, piszemy po angielsku. Bez wyjątków.** Dotyczy to:

- nazw zmiennych, stałych, funkcji i pól obiektów (`softParallax`, nie `łagodnyParallax`;
  `DASH_LENGTH`, nie `O_NAS_PAUZA_DL`),
- klas CSS i modyfikatorów (`.parallax-img--soft`, `.marquee-track--hero`; nie
  `.ładny-paralax`, nie `.marquee-track--o-nas`),
- zmiennych CSS (`--parallax`, `--grid-size`; nie `--zanik`),
- atrybutów `data-*` (`data-image-grow`, `data-progress-bar`; nie `data-obrazek-rosnie`,
  nie `data-czas`),
- nazw plików i komponentów (`Menu.astro`, `stock/two-business-partners-office.jpg`).

Polski zostaje **wyłącznie** w treści widocznej na stronie (napisy, `alt`, `aria-label`,
teksty w `data/*.js`) i w plikach `.md`. Komentarzy nie ma wcale — patrz punkt 1.

Dlaczego to nie jest kwestia gustu: nazwa z polskimi znakami wymusza dobre kodowanie
w każdym narzędziu, które ją tknie (bundler, git, hosting, edytor kolegi), a mieszanka
dwóch języków w jednym pliku sprawia, że nie da się szukać po projekcie jedną frazą.

Do posprzątania (zastane, nie z tej reguły): kilka nazw
`data-*` opisanych po polsku w `animacje.md` (`data-obrazek-rosnie`, `data-tlo-ciemne`,
`data-pasek-postepu`, `data-przejscie`, `data-czas`, `data-prog`) — w kodzie te haki mają
już nazwy angielskie, rozjechała się sama dokumentacja.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
