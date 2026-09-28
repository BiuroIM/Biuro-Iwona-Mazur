# Animacje

Mechanizm animacji (GSAP + ScrollTrigger + Lenis) wchodzi przez `src/scripts/animations.js`.
Ten plik nie zawiera już samych efektów: trzyma listę `INITS`, `setup()`, `cleanup()`
i podpięcie pod cykl życia View Transitions. Same efekty leżą w `src/scripts/animations/`.
Skrypt jest ładowany globalnie z `BaseLayout.astro`, więc działa na każdej podstronie.
Animacje odpalają się w `setup()` po `astro:page-load` (oraz jako zabezpieczenie po
`DOMContentLoaded`), a `cleanup()` sprząta wszystko przed przejściem między stronami.
Treść zawsze zostaje w HTML (SEO) — animujemy jedynie jej pojawienie.

## Mapa modułów

| plik | co w nim jest |
|---|---|
| `animations.js` | wejście: `INITS`, `setup()`, `cleanup()`, zdarzenia `astro:*` |
| `animations/runtime.js` | rejestracja GSAP, Lenis, bramka kurtyny, `colorToken`, `isDesktopWidth` |
| `animations/reveal.js` | `data-animate`, `data-reveal-lines`, `data-words-scrub`, `data-image-reveal`, `data-photo-tone` |
| `animations/counters.js` | `data-counter`, `data-progress-bar` |
| `animations/scenes.js` | `data-image-grow`, `data-dark-bg`, `data-logo-wall`, `data-cards`, `data-headline-pin`, `data-footer-transition`, `data-active-list`, `data-parallax` |
| `animations/rope.js` | `data-rope` |
| `animations/horizontal.js` | `data-horizontal`, `data-rise`, `data-rise-swipe` |
| `animations/scrollBar.js` | `data-scroll-bar` |
| `animations/faq.js` | `data-faq` |
| `animations/forms.js` | kroki formularza, wysyłka `sendLead`, szuflada kontaktowa |
| `animations/select.js` | `data-select` |
| `animations/cursor.js` | `data-cursor-label` |
| `animations/navbar.js` | chowanie i pokazywanie navbara |
| `animations/menu.js` | menu pełnoekranowe |
| `animations/chat.js` | `data-chat` |
| `animations/pageTransition.js` | kurtyny między stronami i ekran ładowania |

Moduł, który trzyma `AbortController`, eksportuje też `destroy*` — `cleanup()` woła
je wszystkie z listy `DESTROYERS`.

## Konwencje ogólne

- **Nie używamy** vanilla `IntersectionObserver` ani czystego CSS do reveal — wszystko
  przez GSAP/ScrollTrigger, żeby było zsynchronizowane z Lenis (smooth scroll).
- Rozmiary/odstępy w animowanym markupie trzymamy w `vw` + `clamp` (konwencja projektu).
- Nowe efekty dodajemy jako funkcję `init*` w module tematycznym i wpisujemy do `INITS`.
- Sterowanie parametrami z markupu przez `data-*` (bez ruszania JS).
- ⚠️ **Stan początkowy zawsze też w KLASIE, nie tylko w GSAP.** Element, który GSAP
  chowa dopiero w `setup()`, jest w pełni widoczny od pierwszego malowania aż do
  wykonania bundla (GSAP + Lenis to sporo kilobajtów) — czyli mruga przy każdym
  wejściu na stronę. Wzorce w projekcie: `scale-y-0` na pasach stopki, maska
  `clip-path` na panelu formularza. Wartość w klasie musi być identyczna z tą,
  którą zaraz ustawi `gsap.set`. Sam `inert` nie wystarczy — blokuje fokus i czytniki,
  ale nic nie ukrywa wizualnie.

## Dostępne mechanizmy (haki w markupie)

### `data-animate="fade-up | fade-in | fade-down | fade-left | fade-right | zoom-in"`
Prosty reveal całego elementu przy wejściu w kadr.
Opcje: `data-delay`, `data-duration`, `data-start` (`top 80%`). Gra raz.

⚠️ `data-start` przydaje się dla treści, która **na niskich ekranach wypada w dolnym
pasie pierwszego widoku**. Domyślny próg `top 80%` znaczy, że element leżący niżej niż
80% wysokości okna czeka na scroll, więc na laptopie 1280×720 potrafi zostać niewidoczny
na wejściu, choć na 1440×900 widać go od razu. `data-start="top 98%"` odkrywa go od razu.
Przydaje się w pierwszym rzędzie kafli na `/blog`, który na niższych ekranach wypada
częściowo poniżej progu.

### `data-reveal-lines`
Napis, w którym każda linijka jest w osobnym `span.block.overflow-hidden` (maska),
a tekst w wewnętrznym `span.reveal-line.block`. Linie wjeżdżają spod maski
(`yPercent 110 -> 0`) ze staggerem. Chowają się z powrotem, gdy element opuści
kadr, i grają na nowo po powrocie (`toggleActions: play reverse play reverse`).
Opcje: `data-duration`, `data-delay`, `data-stagger`.
`data-reveal-lines="once"` = odtwórz raz i zostaw odkryte (bez cofania). **Używać dla
napisów w kontenerach STICKY** — inaczej ScrollTrigger (liczący pozycję z naturalnego
miejsca elementu) odpala `reverse` niemal od razu i napis „zapada się" tuż po odkryciu.

⚠️ **Descendery**: margines na descendery (`pb-[0.15em]`) dawaj na `.reveal-line`,
a odstęp kompensuj `-mb-[0.15em]` na masce. NIGDY nie dawaj `pb` na maskę — wtedy
w stanie schowanym widać pasek tekstu (padding powiększa cięcie, a `yPercent`
liczy się od wysokości `.reveal-line` bez tego paddingu). Wzorzec linii:
`<span class="block overflow-hidden -mb-[0.15em]"><span class="reveal-line block pb-[0.15em]">…</span></span>`

⚠️ **`.text-trim` w masce obcina litery.** Klasa `.text-trim` (`text-box-trim: trim-both`,
`text-box-edge: cap alphabetic`) przycina pudełko tekstu do wysokości wersalika u góry
i do linii pisma u dołu. Wszystko, co wychodzi poza ten pas — descendery (`g`, `y`,
ogonki), nadlewki liter okrągłych (`O`, `0`, `8`) i znaki diakrytyczne nad wersalikami —
leży POZA pudełkiem elementu, więc otaczające `overflow-hidden` je ścina. Zmierzone
przypadki: karuzela „Usługi" traciła 48,6 px dolnej części `g` przy piśmie 259 px,
karuzela „O nas" po 4,1 px u góry i u dołu, numer na ekranie wczytywania 2 px u góry.

Zapas dawaj na MASCE (`pt`/`pb`) i kompensuj ujemnym marginesem, żeby nie ruszyć
układu. Wielkości: descender w Clash Grotesk to ~0,19em, nadlewka liter okrągłych
~0,016em. Przy piśmie w `vw` przelicz na `vw` i pamiętaj o osobnej wartości dla
wariantu `max-lg`, bo tam stopień jest inny.

⚠️ Wyjątek: przy `data-reveal-lines` zapas u dołu na masce zdradza tekst w stanie
schowanym (patrz akapit wyżej), a przy `data-direction="down"` to samo robi zapas
u góry. Tam zapas musi iść na `.reveal-line`. Karuzele w hero animacji linii nie mają
(to `marquee-track` + `aria-hidden`), więc padding na masce jest tam bezpieczny.

### `data-words-scrub`
Akapit rozbijany JS-em na wyrazy (`span.scrub-word`). Wyrazy rozjaśniają się
`data-from -> data-to` jeden po drugim, w kolejności czytania (lewo → prawo),
powiązane ze scrollem na sztywno (`scrub: true`) — efekt „scroll text fill".
Opcje: `data-from` (0.6), `data-to` (1), `data-start` (`top 80%`), `data-end` (`top 30%`).

⚠️ TEMPO reguluje się **zakresem**, nie czasem ani krzywą: przy scrubie postęp jest
funkcją pozycji scrolla, więc „wolniej" znaczy „rozłożone na dłuższym dystansie
przewijania". Domyślne `top 80% -> top 30%` to ~50vh; rozsunięcie do
`top 95% -> top 20%` daje ~75vh, czyli efekt o połowę spokojniejszy.
Przydaje się przy **dużym stopniu pisma**, gdzie domyślny zakres wypada na wiele
wierszy naraz i rozjaśnianie przelatuje zbyt szybko (tak jest ustawiony duży akapit
w wersalikach na `o-nas`). Wartości trzymaj w markupie, żeby nie zmieniać tempa
wszystkim pozostałym wystąpieniom.

⚠️ Te dwie liczby robią **różne** rzeczy: `data-start` decyduje, jak wcześnie efekt
rusza, a `data-end`, jak wysoko w kadrze się domyka. Chcąc samo „wolniej" bez
opóźniania końca, podnoś procent w `data-start` i **nie ruszaj** `data-end` — zejście
z końcem do `top 5%` domyka akapit dopiero przy górnej krawędzi ekranu, co czyta się
jako animacja kończąca się za późno.

### `data-image-reveal`  ⭐ konwencja całej strony
Zdjęcie zakryte panelem (`.reveal-panel`, `absolute inset-0`) obecnym w HTML od pierwszego
renderu. Kolor panelu **nie** stoi w klasie w markupie, tylko w `global.css`, i jest
mieszany przez `color-mix` między tłem strony a `--color-ink` w proporcji `--dark-veil`.
Nigdy nie wpisuj tam heksa ani samego `bg-[var(--page-background)]` — panel zostałby
jaśniejszym prostokątem nad zdjęciem wszędzie, gdzie tło strony jest ciemne.

Przy wejściu w kadr panel zwija się w dół (`scaleY 1 -> 0`, `transformOrigin: bottom`), więc zdjęcie odsłania się
**od góry do dołu**. Kontener musi mieć `relative overflow-hidden`.

**Kaskada lewo → prawo (obowiązuje na CAŁEJ stronie):** opóźnienie startu liczone jest
automatycznie z poziomej pozycji środka zdjęcia (im bardziej w prawo, tym później),
więc każdy wiersz zdjęć odsłania się kaskadowo od lewej do prawej — bez ręcznego
ustawiania delayów. Każde nowe zdjęcie na stronie po prostu dostaje `data-image-reveal`
i wpisuje się w ten sam rytm.

⚠️ **Opóźnienie musi być POZYCJĄ NA TIMELINE, nie parametrem `delay` tweena.** GSAP
ignoruje `delay` w tweenie, który ma własny `scrollTrigger`: ScrollTrigger odtwarza taki
tween przez `play()`, a to startuje od czasu zero, już za opóźnieniem. Efekt jest cichy,
bo animacja normalnie się odtwarza, tylko cała kaskada rusza równocześnie.
Zmierzone: trzy karty w wierszu na `/blog` startowały z różnicą **0 ms** przy
oczekiwanych 100 ms. Poprawny zapis to timeline z opóźnieniem jako trzecim argumentem:

```js
gsap.timeline({ scrollTrigger: { trigger, start, toggleActions: 'play none none none' } })
   .fromTo(panel, { scaleY: 1 }, { scaleY: 0, duration }, delay);
```

Po zmianie te same trzy karty startują z różnicą 90 i 100 ms.

⚠️ **Ten sam błąd siedzi jeszcze w trzech hakach**, które podają `delay` obok
`scrollTrigger`: `data-animate` (`initAnimations`), `data-reveal-lines`
(`initLineReveal`) i `data-counter` (`initCounters`). Tam `data-delay` również nie
działa, choć jest używany w markupie w kilku miejscach. Naprawa jest ta sama
(timeline + pozycja), ale zmienia rytm animacji na każdej podstronie, więc do zrobienia
świadomie, nie po drodze.

Opcje: `data-duration` (domyślnie 1.1), `data-delay` (bazowe opóźnienie),
`data-delay-desktop` (dodatkowe opóźnienie **tylko od 64rem w górę**),
`data-stagger-x` (rozrzut w poziomie w sekundach na całą szerokość ekranu, domyślnie 0.3).

**`data-delay-desktop` — opóźnienie tylko na komputerze.** Sumuje się z `data-delay`
i z kaskadą poziomą. Poniżej 64rem wynosi zero, czyli na telefonie zdjęcie odsłania się
bez zwłoki. Powód rozdzielenia: na dużym ekranie tekst i zdjęcie widać jednocześnie,
więc opóźnienie zdjęcia buduje kolejność czytania (najpierw nagłówek, potem kadr).
Na telefonie te elementy i tak są jeden pod drugim, wchodzą w kadr osobno, a każde
dodatkowe opóźnienie czyta się tam po prostu jako wolna strona.

Granica 64rem to ta sama, którą trzyma cała strona (`max-lg` w Tailwindzie,
`@media (width < 64rem)` w `global.css`).

Wartości używane w projekcie: **0.35** dla dużych kadrów pod nagłówkiem (hero
wyróżnionego wpisu na `/blog`, okładka wpisu, hero strony głównej), **0.2** dla kart
w siatkach (wpisy na `/blog`, „Czytaj dalej"). Powyżej ~0.5 zdjęcie zaczyna wyglądać
jak niedoczytane, a nie jak animowane.

⚠️ Opóźnienie liczone jest **raz, przy inicjalizacji**, tak samo jak kaskada pozioma.
Po zmianie szerokości okna przez granicę 64rem trzeba odświeżyć stronę, żeby wartość
została przeliczona. W praktyce nie przeszkadza: użytkownik nie przechodzi z telefonu
na komputer w trakcie sesji.

Przykład:
```html
<div class="relative w-full overflow-hidden rounded-[clamp(1rem,1.5vw,2rem)] h-[...]" data-image-reveal>
  <div class="reveal-panel absolute inset-0 z-10"></div>
  <!-- tu właściwe zdjęcie, z `class="parallax-img" data-parallax` — patrz niżej -->
</div>
```

⚠️ **Pod panelem nie może być nic widocznego.** Zdjęcie w kadrze `data-image-reveal` jest
ukryte (`visibility: hidden` w `global.css`) i pokazuje się dopiero w chwili startu animacji,
przez `timeline.set(photo, { autoAlpha: 1 }, delay)`. Kadr **nie dostaje `bg-placeholder`** —
w odróżnieniu od pustych ramek makietowych, które zdjęcia nie mają wcale.

Powód nie jest kosmetyczny w tym sensie, że da się go zmierzyć: zaokrąglony `overflow-hidden`
obcina zdjęcie i panel jako dwie osobne warstwy kompozytora, każdą z własnym wygładzaniem.
Na łuku narożnika zostaje po zdjęciu do 25% koloru i widać cienki, ciemniejszy łuk **zanim
animacja w ogóle ruszy**. Pomiar na stronie głównej: 115–124 odstające piksele na kadr,
odchylenie do 60/255. Po ukryciu zdjęcia i zdjęciu `bg-placeholder`: 0 pikseli wewnątrz kadru.

Czego **nie** próbować, bo zostało zmierzone i nie działa: powiększanie panelu (`inset: -2px`),
`translateZ(0)` ani `isolation: isolate` na kadrze, `border-radius` na samym zdjęciu (zaokrągla
jego własne pudełko, które przy parallaksie wystaje o 12% poza kadr, więc łuk wypada poza
widocznym obszarem). `clip-path: inset(0 round …)` zamiast zaokrąglonego `overflow` czyści
narożniki, ale przy niecałkowitej wysokości kadru rozmywa prostą krawędź i wychodzi gorzej.

Bez JS-u zdjęcia zostają niewidoczne. To nie jest nowe ryzyko: bez JS-u panel i tak nigdy się
nie zwija, więc zdjęcia i wcześniej były zakryte.

### `data-obrazek-rosnie`
Obrazek **powiększa się wraz ze scrollem** — od swojej naturalnej szerokości (tej
z klasy) do `data-do` procent **pola treści rodzica**. Domyślne `100` = obrazek
dochodzi równo do paddingu sekcji, czyli do tego samego marginesu, który trzyma resztę
strony.
Opcje: `data-do` (100), `data-start` (`top 65%`), `data-end` (`top 15%`).

⚠️ Celem jest **zmierzone pole rodzica**, a nie procent `innerWidth`. `vw` liczy się
od szerokości okna **razem z paskiem przewijania** (rezerwowanym na stałe przez
`scrollbar-gutter: stable`), więc „96vw" wypada o kilka pikseli na stronę szerzej niż
treść sekcji z `px-[2vw]` — obrazek przekraczałby margines zamiast się z nim zrównać.
Pomiar rodzica daje padding za darmo, jakikolwiek by był. `clientWidth` zawiera
padding rodzica, więc jest on odejmowany.

⚠️ Rośnie **skalą, nie szerokością**. Przy rosnącej szerokości zmieniałaby się też
wysokość (trzyma ją `aspect-*`), więc wysokość całej strony pełzłaby w trakcie scrolla
— ScrollTrigger musiałby się przeliczać w każdej klatce, a pozycje startowe pozostałych
animacji dryfowałyby. Transform nie dotyka layoutu.

⚠️ `transformOrigin: top center` — obrazek rozchodzi się na boki i **w dół**, górna
krawędź stoi w miejscu (ma trzymać się tekstu nad sobą). Przyrost u dołu **trzeba
zarezerwować paddingiem sekcji**, inaczej obrazek wjedzie w to, co jest niżej.
Przyrost = `wysokość × (szerokość docelowa / startowa − 1)`; dla 70vw → 96vw przy 16/9
to ~14.6vw, stąd `pb-[15vw]` na sekcji w `o-nas.astro`.

⚠️ Skala liczona z realnego `offsetWidth`, więc szerokość startowa **nie jest
duplikowana** w JS ani w atrybucie — zmiana `w-[…]` w markupie wystarcza.
`invalidateOnRefresh` przelicza ją po zmianie rozmiaru okna.

Łączenie z [`data-image-reveal`] na tym samym elemencie działa (różne cele: panel
w środku vs. kontener), ale **rozsuń je w czasie** — `data-image-reveal` startuje
na sztywno przy `top 80%`, więc powiększanie zacznij później, inaczej oba ruchy
dzieją się jednocześnie i zjadają się wzajemnie.

### `data-logo-wall` + `data-logo-col`  (wzorzec sticky pin)
Ściana kolumn (np. „ONI NAM ZAUFALI"). Struktura: **wysoki kontener** `data-logo-wall`
(cała sekcja, np. `h-[300vh]`) wyznacza dystans scrolla, a w środku **sticky „scena"**
(`sticky top-0 h-screen overflow-hidden`) przykleja się na cały ekran. Napis
(`data-reveal-lines`) leży w tle u góry (`absolute inset-x-0 top-0 z-0`), a kolumny
`data-logo-col` na wierzchu (`absolute inset-x-0 top-0 z-10 flex gap-...`), każda
`flex-1` z odstępem, kafle o stałych wysokościach (vw).

Implementacja: jedna **oś czasu** (`gsap.timeline`, `scrub`, `start: top center` —
kolumny ruszają gdy sekcja wchodzi w kadr, nie dopiero gdy wypełni ekran; `end:
bottom bottom`). Pozycja tweena na osi = moment reakcji na scroll. Skrajnie
**prawa rusza pierwsza**, kolejne w lewo `krok` później, **lewe jadą szybciej**
(krótszy czas). Kolumny startują schowane pod dolną krawędzią (napis widoczny) i
wjeżdżają w górę, aż **całkowicie znikną nad górą** (dystans z realnej `offsetHeight`
+ `data-exit-margin`). Ruch w **vh**, plus stały **zjazd w dół** prawo→lewo.
⚠️ Scena **nie ma** `overflow-hidden` (celowo). Oś czasu biegnie do `bottom top`, czyli
dłużej niż sam pin (sticky puszcza już przy `bottom bottom`) — przez ostatni odcinek
scena jedzie w górę razem ze stroną, więc maska obcinałaby kolumnom dolną krawędź
w trakcie ruchu. Bez niej logo dojeżdżają w całości.

Opcje na kontenerze: `data-start` (pozycja startowa top w vh, domyślnie 100),
`data-col-drop` (zjazd w dół na kolumnę prawo→lewo w vh, domyślnie 10),
`data-col-delay` (opóźnienie startu / krok czasu na kolumnę, domyślnie 0.25),
`data-duration` (czas najszybszej/lewej kolumny, domyślnie 1),
`data-exit-margin` (zapas nad górą, by w pełni zniknęły, w vh, domyślnie 10).

### `data-headline-pin`  (napis pinowany: wjazd → hold → wyjazd)
Napis na środku ekranu, który przy scrollu wjeżdża, chwilę stoi i wyjeżdża górą
(znika). Struktura jak sticky pin: sekcja `data-headline-pin` (wysoki kontener,
np. `h-[220vh]`), w środku `sticky top-0 h-screen flex items-center justify-center
overflow-hidden`. Linie napisu w maskach jak w [reveal-lines]: maska
`overflow-hidden -mb-[0.15em]`, tekst w `.headline-line` (`block pb-[0.15em]`).
Scrubowana oś czasu (`start: top top`, `end: bottom bottom`) w 3 fazach: wjazd
(`yPercent 110 -> 0`), hold (pusty tween), wyjazd górą (`yPercent 0 -> -110`). Start
przy `top top` — sekcja jest wtedy przyklejona, a napis wycentrowany (poziom + pion),
i dopiero wtedy się odkrywa. Proporcje faz = ile scrolla zajmuje każda.
Opcje: `data-stagger` (0.08), `data-in` (czas wjazdu/rewela, 2), `data-hold` (0.8),
`data-out` (czas wyjazdu, 1.2).

### `data-pasek-postepu`
Wskaźnik pokazujący, **ile sekcji już przewinięto**, w kształcie buttona (na `o-nas`:
500 × 100 px). Atrybut idzie na WYPEŁNIENIE (`absolute inset-0` w środku toru);
`scaleX` rośnie 0 → 1 w takt scrolla, malując całe tło kształtu od lewej do prawej.
Po pełnym wypełnieniu wskaźnik **znika**.
Opcje: `data-trigger` (selektor sekcji będącej zakresem; bez niego najbliższa
`<section>`), `data-start` (`top top`), `data-end` (`bottom bottom`),
`data-zanik` (0.06 — długość zanikania na osi).

Elementy opcjonalne w torze: `data-pasek-ikona` (patrz niżej).

⚠️ `scrub: true` i `ease: 'none'` — wskaźnik jest odwzorowaniem pozycji scrolla, nie
animacją. Każda inna krzywa rozjeżdża wskazanie z tym, co użytkownik przewinął.

⚠️ Stan początkowy zapisuj `[transform:scaleX(0)]`, **nie** utilitką `scale-x-0`.
Tailwind v4 realizuje ją osobną właściwością `scale`, która składa się z transformem
GSAP-a przez **mnożenie** — pasek zostałby na zerze na zawsze. Klasa i GSAP muszą
pisać po tej samej właściwości. (Kurtyna przejścia używa `scale-x-0` bezpiecznie,
bo tam GSAP jawnie zeruje `scaleX` w `gsap.set` przy każdym przebiegu.)

⚠️ Zaokrąglenie i `overflow-hidden` dawaj na TORZE, nie na wypełnieniu: rosnące skalą
wypełnienie miałoby promień narożnika rozciągnięty w poziomie.

⚠️ `data-zanik` zabiera czas POSTĘPOWI. `scrub` rozciąga całą oś na zakres scrolla,
więc przy 0.06 pasek jest pełny po ~94% sekcji, a ostatnie ~6% to zanikanie.

⚠️ Zanikanie toru składaj przez `fromTo` z jawnym `{ autoAlpha: 1 }`, **nie** przez samo
`to({ autoAlpha: 0 })`. Przy zwykłym `to` GSAP zapisuje wartość startową przy pierwszym
renderze, a `restoreStatesAfterRefresh` woła `invalidate()`, po którym start zapisuje się
**od nowa, z aktualnego stanu DOM**. Jeżeli odświeżenie ScrollTriggera wypadnie za końcem
sekcji (a tam tor jest już wygaszony), startem staje się `autoAlpha: 0` i tween robi się
0 → 0: wypełnienie dalej scrubuje się poprawnie, ale **cały pasek jest niewidoczny do
przeładowania strony**. Odświeżenie odpala każdy resize okna i `document.fonts.ready`,
więc wystarczyło raz zmienić rozmiar okna poniżej sekcji, żeby pasek zniknął na dobre.
Dlatego `restoreStatesAfterRefresh` cofa też animację na `progress(0)` PRZED
`invalidate()` — wtedy odczyt startu wypada na stanie początkowym, a nie końcowym.
Jawne `fromTo` jest drugim zabezpieczeniem, niezależnym od tej kolejności.

**Ikonka nad wypełnieniem** (`data-pasek-ikona`): wypełnienie w końcówce wjeżdża pod
nią, więc jasna ikonka zniknęłaby na jasnym tle. Jej kolor przeskakuje na ciemny
dokładnie w chwili, gdy krawędź wypełnienia mija jej ŚRODEK; moment liczony
z geometrii (`offsetLeft` w torze), nie wpisany na sztywno. To ten sam zabieg co
podmiana koloru napisu w buttonie CTA, tylko sterowana scrollem, nie hoverem.

⚠️ Atrybut dawaj na `<span>` owijającym SVG, **nie** na `<svg>`: elementy SVG nie mają
`offsetLeft`/`offsetWidth`, więc wyliczenie momentu by nie zadziałało. Kolor na spanie,
a kreski SVG pobierają go przez `currentColor`.

### `data-tlo-ciemne`  (tło strony ciemnieje na czas sekcji)
Sekcja przyciemnia **całe tło strony** do `--color-ink` na czas swojego trwania, a po
wyjściu z niej tło wraca do jasnego. Ciemność daje jedna wspólna warstwa
`data-tlo-ciemne-warstwa` (`fixed inset-0`, `opacity-0` w klasie), wygaszana do
pełnego krycia.
Opcje na sekcji: `data-start` (`top top`), `data-end` (`bottom top`),
`data-czas-tla` (0.5).

⚠️ Koniec zakresu to `bottom top`, czyli moment, w którym sekcja **cała** opuszcza kadr
— nie `bottom bottom`. Przy `bottom bottom` przyklejona sceneria przestaje się kleić,
ale jeszcze przez jeden ekran wyjeżdża w górę ze swoją jasną treścią, więc rozjaśnienie
tła zostawiłoby jasny tekst na jasnym tle.

⚠️ Razem z warstwą leci na `:root` liczba `--dark-veil` (0 → 1, ta sama długość i ta sama
krzywa, jedna wspólna oś czasu). Steruje ona kolorem paneli `.reveal-panel`, bo warstwa
ciemna ma `-z-10`, czyli leży POD treścią strony — panele zasłaniające zdjęcia malują się
nad nią i przy stałym jasnym kolorze świeciły jako jasne prostokąty na ciemnym tle.
Widać to było w sekcji FAQ i na kaflach bloga zaraz pod ciemną sekcją: najpierw jasny
prostokąt, potem tło wracało do jasnego i dopiero wtedy wyjeżdżało zdjęcie. Cokolwiek
jeszcze dodasz malowanego kolorem tła strony NAD treścią, przepuść przez `--dark-veil`.

⚠️ `data-start` i `data-end` czyta **także logika navbara** (chowa się na ciemnym tle,
bo ma ciemny tekst). Trzymaj oba mechanizmy na tych samych wartościach, inaczej navbar
da się wyciągnąć na ciemne tło albo zniknie przy jasnym.

⚠️ Warstwa musi leżeć **poza** sekcją i mieć `-z-10`. Ujemny z-index w głównym
kontekście składania stawia ją za całą treścią, ale nad tłem body. Umieszczona
wewnątrz sekcji (ta tworzy własny kontekst) przykryłaby to, co jest pod nią, czyli
stopkę — krycie nie wraca do zera przy wyjściu dolną krawędzią.

⚠️ Nie zamieniaj tego na `background-color` na `body`. Tło strony to kolor **plus**
biała siatka w `background-image`, a obrazków tła nie da się animować przejściem:
siatka przeskoczyłaby w jednej klatce, gdy kolor jeszcze płynie.

⚠️ Dlatego jasne tło strony nie siedzi na `body`, tylko na osobnym `.page-canvas`
(`absolute inset-0`, `-z-20`, pierwszy element `body`, które ma `position: relative`).
Powód jest w kolejności malowania: warstwa ciemna ma `-z-10`, a ujemne z-indeksy
malują się **przed** tłami zwykłych bloków. Dopóki tło było na `body`, działało to
tylko dzięki temu, że przeglądarka przenosi tło `body` na kanwę — a robi to wyłącznie
wtedy, gdy `html` nie ma własnego tła. W chwili otwarcia formularza, menu albo czatu
Lenis dokłada `html.lenis-stopped`, a ta reguła nadaje `html` ciemne tło (żeby pasek
po `scrollbar-gutter` nie świecił obok ciemnego panelu). Przeniesienie tła na `html`
wyłączało przenoszenie tła `body` na kanwę, więc jasne tło `body` malowało się nad
warstwą ciemną i czerń sekcji znikała na czas otwartego panelu.

Podział ról po poprawce: `html` trzyma tło jako podkład dla paska `scrollbar-gutter`
(ciemne przy `lenis-stopped`), `.page-canvas` maluje właściwe tło strony wraz z siatką
i przewija się razem z dokumentem, a warstwa ciemna leży między nimi.

Gaszenie działa w obie strony (`play reverse play reverse`), więc tło wraca do jasnego
zarówno przy zjeżdżaniu poniżej sekcji, jak i przy powrocie nad nią.

Navbar chowa się na ten czas automatycznie (ma ciemny tekst) — patrz [`data-navbar`].
Treść w takiej sekcji pisz jasnym kolorem (`--color-canvas`).

### `data-przejscie`  (przejście między podstronami: wielowarstwowa kurtyna)
Kurtyna zamykana od obu krawędzi, w **pięciu warstwach** o rampie kolorów od zieleni
kart usług do ciemnego akcentu. Warstwa: `PrzejscieStron.astro`, renderowana raz
w `BaseLayout` (z-70, nad navbarem i panelem formularza).

Przebieg:
1. warstwy zbiegają się z lewej i z prawej ku środkowi, jedna po drugiej (co
   `KROK_WARSTWY`), od najjaśniejszej do najciemniejszej,
2. Astro podmienia stronę pod zasłoną,
3. warstwy rozwierają się ku krawędziom w **odwrotnej kolejności**: najpierw
   najciemniejsza (spod niej wychodzi jaśniejsza), na końcu najjaśniejsza, która
   odsłania nową stronę.

Rampa (liczona liniowo w RGB, kroki po 25%) i krzywe siedzą w **jednej tablicy**
w komponencie — `animations.js` nie wie nic o liczbie warstw ani o kolorach, więc dodanie
albo usunięcie warstwy to jedna linia:

| # | kolor | krzywa | stopień |
|---|---|---|---|
| 1 | `--color-canvas-deep` (karty usług) | `power0.inOut` | liniowa |
| 2 | `#a3b990` | `power1.inOut` | kwadratowa |
| 3 | `#768365` | `power2.inOut` | sześcienna |
| 4 | `#484d3b` | `power3.inOut` | czwartego stopnia |
| 5 | `--color-ink` (ciemny akcent) | `power4.inOut` | piątego stopnia |

⚠️ **Nazewnictwo krzywych GSAP jest przesunięte o jeden.** Numer w nazwie jest o jeden
**mniejszy** niż stopień wielomianu (`gsap-core.js`:
`_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", …)` → `Power0..Power4`). Czyli
`power1` = kwadratowa, `power2` = sześcienna. Łatwo się na tym pomylić o jeden.
Im wyższy wykładnik, tym mocniej warstwa zwleka na starcie i hamuje na końcu — kolejne
warstwy coraz bardziej „ociągają się", więc odstępy między krawędziami nie są stałe
i kurtyna rozwarstwia się w ruchu.

⚠️ **Kolejność warstw w DOM jest sensem efektu.** Rampa musi iść od jasnej do ciemnej,
bo pierwsza pozycja tablicy leży na spodzie stosu — inaczej jasna zakryłaby ciemną
na końcu zasłaniania i ekran zostałby zielony. A przy rozwieraniu kolejność musi być
odwrotna niż przy zasłanianiu: gdyby warstwy otwierały się w tej samej kolejności,
jaśniejsze znikałyby pod ciemniejszymi i efekt zredukowałby się do jednowarstwowego.

⚠️ **Zakładka na środku.** Połowa ma `w-[50.4%]`, nie `50%`. Przy nieparzystej szerokości
okna 50% wypada na ułamku piksela, a każda połowa ma własny transform, czyli własną
warstwę kompozycji — bez zakładki ich antyaliasowane krawędzie nie schodzą się i dokładnie
w momencie spotkania na środku ekranu zostaje włos prześwitu. 0.4% na stronę = 0.8%
zachodzenia, niewidoczne przy jednolitym kolorze.

⚠️ **Punkt zaczepienia jest ustawiany dwa razy** — klasami (`origin-left` / `origin-right`,
dla stanu przed odpaleniem skryptu) i jawnie w GSAP. Bez tej drugiej wystarczyłaby jedna
zmiana klasy, żeby połowy zaczęły skalować się od środka i rozjechały się z zakładką.

⚠️ `scale-x-100` w klasie trzyma kurtyny **ZASUNIĘTE**, zanim odpali się skrypt — i to
jest wejście na stronę: przy twardym wczytaniu ekran jest zakryty od pierwszej klatki,
a `odsloni()` (na `astro:page-load`, czyli też przy pierwszym wejściu) rozwiera kurtynę
i odsłania gotową stronę. Osobnego ekranu wczytywania nie ma — kurtyna jest jednocześnie
zasłoną na czas wczytywania i animacją wejścia. Konsekwencje:

- bramka animacji wejścia (`curtainOpen` w `animations/runtime.js`) startuje **zamknięta**,
  inaczej reveale pierwszego ekranu odegrałyby się pod zasłoną,
- bez skryptów strona zostałaby zakryta, więc awaryjne rozwarcie jest w `global.css`
  (`@media (scripting: none)`).

Uwaga: Tailwind v4 realizuje skalę właściwością `scale`, a nie `transform` — GSAP składa
je poprawnie (przy pierwszym dotknięciu elementu wciąga `scale`/`rotate`/`translate` do
własnego transformu), ale to ta sama pułapka co przy `translate`/`rotate` w FAQ, więc nie
zamieniaj tego na własną regułę.

⚠️ `<html transition:animate="none">` w `BaseLayout` wyłącza domyślne przenikanie Astro
— inaczej nowa strona przenikałaby jeszcze pod rozwierającymi się kurtynami.

Podpięcie pod cykl życia `ClientRouter` (obie funkcje w `animations.js`):
- `astro:before-preparation` → podmieniamy `event.loader` na taki, który najpierw czeka
  na `zaslon()`, a dopiero potem pobiera stronę. Astro czeka na zwrócony Promise, więc
  podmiana **nigdy** nie zdarzy się przy odsłoniętym ekranie.
- `astro:page-load` → `odsloni()`. Celowo nie `astro:after-swap`: tam `setup()` jeszcze
  nie ustawił stanów początkowych animacji, więc mignąłby napis bez maski.

Tempo (stałe na górze `animations/pageTransition.js`): `CZAS_KURTYNY` (0.65) i `KROK_WARSTWY`
(0.09). Krzywe **nie są** w JS — każda warstwa nosi swoją w `data-przejscie-krzywa`.
Jedno przejście to `CZAS_KURTYNY + 4 × KROK_WARSTWY` ≈ **1,0 s** w każdą stronę.

Wszystkie warstwy mają ten sam czas przejazdu, różnią się startem (`KROK_WARSTWY`)
i krzywą. Wyrównanie ruchu = wpisanie tej samej krzywej we wszystkie wiersze tablicy.

⚠️ Zmieniając `CZAS_KURTYNY` przeliczaj `KROK_WARSTWY` w tej samej proporcji
(~0.13 czasu przejazdu) — to on decyduje o rytmie, czyli o tym, ile poprzedniej warstwy
widać, zanim następna ją dogoni. Przy dłuższej animacji ze starym krokiem warstwy zlewają
się w jedną, przy krótszej rozjeżdżają się na osobne, wyraźnie odklejone przejazdy.

### `data-cursor-label`  (własny kursor: kółko z napisem)
Element z tym atrybutem chowa systemowy kursor (`cursor: none` w `global.css`) i zamiast
niego pokazuje jedno wspólne kółko `data-cursor` z `BaseLayout` — ciemnozielone
(`bg-forest`), z napisem branym z wartości atrybutu. Używają go kafle wpisów na `/blog`
(`data-cursor-label="Zobacz"`).

Kółko podąża za wskaźnikiem przez `gsap.quickTo` z `power3.out`, więc leci z lekkim
opóźnieniem za myszą, a nie klei się do niej. Czas dojazdu to 0,25 s (było 0,35 s):
poślizg ma być wyczuwalny, ale nie gumowy. Pozycję przy odsłonięciu ustawia `gsap.set`,
żeby kółko nie przyjeżdżało z poprzedniego miejsca. Centrowanie na wskaźniku
robi `xPercent: -50, yPercent: -50` w GSAP, **nie** klasy `-translate-x-1/2` — GSAP
nadpisuje cały `transform`, więc klasa i tak by nie zadziałała.

⚠️ O tym, czy kółko jest widoczne, **nie** decydują `pointerenter`/`pointerleave` na
kaflach. Skrypt pamięta ostatnią pozycję myszy i raz na klatkę pyta
`document.elementFromPoint`, co pod nią leży, a potem `closest('[data-cursor-label]')`.
Test powtarza się też przy każdym `scroll`. Powód: przy `pointerenter`/`pointerleave`
kółko zostawało na ekranie po zjechaniu z kafla kółkiem myszy — strona przesuwała się pod
nieruchomym wskaźnikiem, a przeglądarka przy przewijaniu programowym (Lenis) nie wysyłała
`pointerleave`. Hit test nie ma tego problemu, bo nie polega na zdarzeniach wejścia
i wyjścia: chowa kółko również wtedy, gdy kafel zasłoni kurtyna przejścia albo menu.

⚠️ Wszystkie uchwyty sprawdzają `event.pointerType !== 'mouse'` i wychodzą. Bez tego
tapnięcie na telefonie wysyła `pointermove` i kółko mrugałoby przy każdym dotknięciu
kafla. Sam `@media (hover: hover)` przy `cursor: none` tego nie załatwia, bo dotyczy
tylko kursora, nie skryptu.

Wyjście myszy za okno przeglądarki łapie `pointerout` z pustym `relatedTarget`, utratę
okna `blur` — oba chowają kółko i zerują zapamiętaną pozycję, żeby po powrocie nie
mrugnęło w starym miejscu.

### `data-select`  (własna lista rozwijana w formularzach)
`CustomSelect.astro` zastępuje systemową listę `select`. Warstwa widoczna to `button`
(`data-select-trigger`) plus panel `data-select-list` z opcjami jako `button`
(`data-select-option`). Wartość trzyma **prawdziwy `select`** (`data-select-native`),
schowany jako `absolute inset-0 opacity-0 pointer-events-none` z `tabindex="-1"`.

Dlaczego native zostaje w DOM: on odpowiada za `name`, wysyłkę w `FormData` i walidację.
`bindFormSteps` sprawdza krok pętlą po `input, textarea, select`, więc bez niego trzeba by
dopisywać osobną walidację, a `required` na `input type="hidden"` nie działa (pola ukryte są
wyłączone z walidacji). Po wyborze skrypt ustawia `native.value` i wysyła `change`.

Obsługa klawiatury na triggerze: `ArrowDown`/`ArrowUp` otwierają i przesuwają zaznaczenie,
`Enter` wybiera, `Home`/`End` skaczą na skraj, `Escape` i `Tab` zamykają. Stan aktywnej
pozycji siedzi w `data-active`, wybranej w `aria-selected`, a puste pole w
`data-select-value[data-empty]` — kolory tych stanów są w `global.css`, bo jako warianty
Tailwinda kolidowałyby z klasą koloru na tym samym elemencie.

⚠️ Z-index przy otwarciu ustawiamy na **wierszu** (`[data-form-field]`), nie na korzeniu
komponentu. W wysuwanym panelu GSAP zostawia na wierszach `transform` po animacji wejścia,
a to tworzy kontekst składania — z-index wewnątrz naszego wiersza nie przebije wtedy
kolejnych wierszy i lista rysuje się pod nimi. Wiersze są elementami flex/grid, więc
`z-index` działa na nich bez `position`.

⚠️ Kroki formularza są animowane `clip-path`, a `inset()` obcina wszystko poza pudełkiem
kroku, czyli też rozwiniętą listę. Dlatego `showStep` na końcu timeline'u zdejmuje
`clip-path` (`clipPath: 'none'`) z kroku, który właśnie wjechał.

### `data-navbar`  (navbar chowany przy scrollu w dół)
Navbar (`Naglowek.astro`) jest `fixed inset-x-0 top-0 z-50` i towarzyszy stronie przez
cały scroll. Zachowanie:

- scroll **w dół** → wyjeżdża górą (`yPercent -100`),
- scroll **w górę** → wraca, niezależnie od tego, jak daleko jesteśmy na stronie,
- w strefie przy górnej krawędzi (`data-prog`, domyślnie 15vh) stoi **zawsze** widoczny,
- na czas **ciemnych scen** zostaje schowany (ma ciemny tekst, więc na `--color-ink` byłby
  niewidoczny). Ciemne sceny to `[data-stopka-przejscie]` i `[data-tlo-ciemne]`.

⚠️ Aktywne ciemne sceny są **liczone**, nie trzymane w jednym boolean: stykają się ze
sobą (sekcja z ciemnym tłem przechodzi wprost w stopkę), więc wyjście z pierwszej
wyzerowałoby flagę, choć druga już trwa, i navbar mrugnąłby na ciemnym tle.

Kierunek bierzemy z `self.direction` ScrollTriggera (1 = w dół, −1 = w górę), a nie
z własnego nasłuchu `scroll` — dzięki temu leci tą samą pętlą co reszta i jest
zsynchronizowany z Lenisem. `data-martwa-strefa` (domyślnie 4 px) zjada mikro-drgania,
żeby navbar nie migotał przy minimalnych ruchach.

⚠️ Chowamy **samym transformem**, bez `autoAlpha` — schowany navbar zostaje w drzewie
dostępności i da się go wyciągnąć tabulatorem (nasłuch `focusin` przywraca go na ekran).
`visibility: hidden` odciąłby klawiaturze dostęp do nawigacji.

⚠️ Przesunięcia w pionie należą do GSAP — **nie dawaj** na `<header>` klas typu
`-translate-y-*`, bo zostaną nadpisane.

Opcje: `data-prog` (strefa „zawsze widoczny" u góry, vh, domyślnie 15),
`data-czas` (czas wjazdu/zjazdu, domyślnie 0.45),
`data-martwa-strefa` (ignorowane drgania w px, domyślnie 4).

### `data-parallax` + klasa `.parallax-img`  ⭐ konwencja całej strony
**Parallax zdjęć.** Kadr (kontener) stoi w układzie strony, a zdjęcie przejeżdża przez
niego wraz ze scrollem: wjeżdża z zapasem u góry i wyjeżdża zapasem u dołu, więc
w kadrze widać ruch wolniejszy niż ruch strony i zmieniające się wycięcie zdjęcia.
Przywiązane do pozycji scrolla (`scrub`), na całej drodze kadru przez ekran
(`top bottom` -> `bottom top`).

Atrybut i klasa idą na **samo zdjęcie**, nie na kontener — kontener nosi już
`data-image-reveal`. Te dwa mechanizmy się nie gryzą: reveal animuje panel
(`.reveal-panel`), parallax animuje zdjęcie pod nim.

`.parallax-img` zastępuje `absolute inset-0 h-full w-full object-cover`: robi to samo,
tylko zdjęcie jest **wyższe niż kadr** o `--parallax` (domyślnie 6%) z każdej strony
i wysunięte w górę o tyle samo, czyli w spoczynku stoi wyśrodkowane, a przy przewijaniu
ma zapas w obie strony.

⚠️ Dlaczego 6%, a nie więcej: przejazd jest **symetryczny** wokół kadru wyśrodkowanego,
więc kadr pokazuje też pas położony **niżej** w zdjęciu. Zdjęcia na stronie są kadrowane
ciasno na ludziach i przy 10% ten dolny skraj ścinał czubki głów (zmierzone: wiersz
trzech zdjęć i pierwszy kafel bloga w chwili wjazdu w kadr). Podnosząc tę wartość
sprawdzaj zdjęcia z twarzą przy górnej krawędzi — pękają pierwsze.

**Siłę efektu reguluje jedna liczba — nadwyżka wysokości w CSS.** Skrypt nie ma
własnego zakresu ruchu: mierzy, ile zdjęcie wystaje poza kadr, i przejeżdża dokładnie
tyle, więc skrajne położenia zawsze wypadają równo z krawędziami i luki nie da się
odsłonić przez pomyłkę.

Inna siła dla JEDNEGO zdjęcia to `class="parallax-img parallax-img--soft"` (8% zamiast
domyślnych 12%). ⚠️ **Nie da się tego zrobić utilitką `[--parallax:8%]` ze znacznika** —
`.parallax-img` siedzi w `global.css` poza warstwami Tailwinda, więc bije wszystko
z `@layer utilities`; po dopisaniu utilitki zmierzone `--parallax` nadal wynosiło 12%.
Nowe warianty dokładaj więc jako klasy obok `.parallax-img--soft`.

Drugi wariant to `.parallax-img--whole`: poniżej `64rem` ustawia `--parallax: 0%`.
Służy do jednej rzeczy — **pokazania na telefonie całego zdjęcia, bez ucinania czegokolwiek**.

Działa, bo obie połowy mechanizmu wyłączają się same. Zdjęcie przestaje być wyższe od
kadru, więc `object-cover` nie ma co obciąć w pionie, a `travel()`
(`(offsetHeight - clientHeight) / 2 - SAFE_EDGE`) wychodzi ujemnie i po `Math.max(0, …)`
zostaje zerem, więc GSAP animuje `y` z 0 do 0. Nie trzeba nic wyłączać w `animations.js`.

⚠️ Sama klasa **nie wystarczy**. `object-cover` nadal obcina boki, jeżeli kadr ma inne
proporcje niż plik. Kadr musi dostać proporcje zdjęcia co do piksela: hero na stronie
głównej ma `max-lg:aspect-[1600/1143]`, bo `112-team-group.jpg` ma 1600×1143.
Przy `max-lg:aspect-[4/3]` z tego samego zdjęcia znikały osoby na obu krańcach rzędu
(obcinane 23% szerokości).

Opcje: `data-start` (`top bottom`), `data-end` (`bottom top`).

⚠️ Zdjęcie w scenie z **pinem** (kontener `sticky`) potrzebuje własnego zakresu przez
`data-start`/`data-end` — domyślny liczy się z naturalnego miejsca kadru, a ten stoi
przyklejony przez wiele ekranów przewijania. Ta sama pułapka, co przy `data-reveal-lines`.

Przykład:
```html
<div class="relative aspect-[4/3] w-full overflow-hidden rounded-[clamp(1rem,1.5vw,2rem)]" data-image-reveal>
  <Image src={...} alt="..." class="parallax-img" data-parallax />
  <div class="reveal-panel absolute inset-0 z-10"></div>
</div>
```

### `data-rise` + `data-rise-item`  (karty wjeżdżają i chowają się pochylone)

Karty specjalistów na `/o-nas`. Hak `data-rise` siedzi na torze poziomym
(`data-horizontal-track`), `data-rise-item` na każdej karcie. Karta wjeżdża prawą
krawędzią ekranu **niżej, przechylona i pomniejszona** (`y`, `rotation`, `scale`),
prostuje się na środku, chwilę stoi równo, po czym **kładzie się w drugą stronę**
i schodzi w dół, znikając lewą krawędzią. Obrót idzie cały czas w tę samą stronę:
`+RISE_TILT` → `0` → `-RISE_TILT`, więc ruch czyta się jak jeden gest, a nie jak dwa
osobne efekty.

Za „kołowość" odpowiada `RISE_PIVOT`, czyli `transformOrigin` przesunięty daleko pod
kartę (`50% 220%`). Obrót wokół punktu leżącego ~1,7 wysokości karty niżej znosi ją
przy okazji w bok i lekko w górę, więc karta jedzie po łuku, jakby siedziała na dużym
kole, zamiast obracać się w miejscu. Wcześniej ten ruch w bok robił osobny `xPercent`
i wyglądał jak doklejony. Uwaga: `transformOrigin` działa też na `scale`, więc
zmniejszenie karty na końcach podciąga ją do góry i częściowo znosi zjazd `y` —
dlatego `RISE_SCALE` jest blisko jedynki, a `RISE_RATIO` niższe niż przy obrocie
wokół środka.

Kluczowe: to **nie jest** jedna oś czasu na cały rząd. Każda karta ma własną oś z
`ScrollTrigger` i `containerAnimation` ustawionym na tween toru poziomego, dzięki
czemu progres liczy się z **pozycji karty na ekranie**, a nie z pozycji scrolla.
Karta reaguje dokładnie wtedy, gdy wjeżdża w kadr, niezależnie od tego, która jest
w kolejności. Tween toru trafia do `horizontalTweens` (WeakMap po sekcji) w
`initHorizontal`, a `initRise` go stamtąd wyjmuje — stąd kolejność w `INITS`:
`horizontal` musi być przed `rise`.

Zakres to pełen przejazd karty przez ekran: `left right` → `right left`. Oś dzieli go
na `RISE_ENTER` / `RISE_HOLD` / `RISE_EXIT`. Postój w środku jest po to, żeby karta
zdążyła być przez chwilę czytelna: bez niego prostowanie płynnie przechodziłoby
w kładzenie się i nigdy nie widać by było równej kartki.

Wyjście musi trwać **tyle samo co wjazd** — stąd `RISE_EXIT = RISE_ENTER` zapisane
przez odwołanie, a nie drugą liczbę. Zakres `left right` → `right left` jest symetryczny
względem środka ekranu (przy `p = 0.5` środek karty stoi na środku okna), więc równe
fazy kładą zwijanie dokładnie tam, gdzie po drugiej stronie leży prostowanie: karta
zaczyna się kłaść zaraz po minięciu środka i kończy w chwili, gdy schodzi lewą
krawędzią. Ease też się odbija: `power2.out` na wjeździe, `power2.in` na wyjściu.

Próba skrócenia samego wyjścia (`0.2` przy `0.5`) skończyła się tym, że zwijania **nie
było widać w ogóle**: cała faza wchodziła w ostatnie ~24% przejazdu, czyli w moment, gdy
karta jest już prawie za lewą krawędzią. Krótsza faza nie znaczy „szybszy gest", tylko
„gest odłożony na koniec drogi" — jeśli zwijanie ma być szybsze, trzeba skrócić **oba**
skraje naraz i zostawić postój, bo inaczej ruch przestaje być symetryczny.

Suma trzech faz nie musi dawać jedynki, bo `scrub` normalizuje całą oś do zakresu
przejazdu: liczą się proporcje, nie wartości.

Ostatnie karty **nie zdążają** rozwinąć fazy wyjścia i to jest zamierzone. Tor ma w
`initHorizontal` zapas przejazdu (`margin`), przez co ostatnia karta kończy z lewą
krawędzią na ~21% szerokości okna (404 px przy oknie 1904 px), czyli na samym progu
zwijania — postój trwa tam między 853 a 537 px lewej krawędzi, a `power2.in` na
pierwszych procentach wyjścia daje ułamek stopnia obrotu, więc koniec sekcji zastaje
kartę prosto ustawioną. Po zmianie rozmiaru kart, wcięcia toru albo proporcji faz warto
ten rachunek powtórzyć — każda z tych rzeczy przesuwa punkt końcowy.

Zjazd w dół liczony jest dynamicznie:
`min(wysokość karty * RISE_RATIO, wolne miejsce pod torem * RISE_SAFE)`.
Drugi człon pilnuje, żeby karta nie wpadła pod `overflow-hidden` sceny. Wolne miejsce
mierzone jest z układu (`offsetParent.clientHeight - offsetTop - offsetHeight`), a nie
z pozycji na ekranie, bo transformy tweena nie zmieniają `offsetTop`.
`invalidateOnRefresh` przelicza to przy zmianie rozmiaru okna.

Opcje na kontenerze: `data-rise-ratio`, `data-rise-start`, `data-rise-end`.

Układ sceny: nagłówek **leży poza sticky** i normalnie odjeżdża ze stroną, w sticky
został sam tor (`justify-center`). Wcześniej nagłówek siedział w środku i wisiał przez
całą sekcję. Karty mają `27vw`, a sekcja `520vh`: szersza karta to dłuższy tor, więc
sekcja musi być wyższa, żeby tempo przejazdu (dystans toru na piksel scrolla) zostało
takie samo. Wysokość karty limituje z kolei zjazd, bo zabiera miejsce pod torem.

Tor ma z lewej duże wcięcie (`pl-[52vw]` przy `pr-[2vw]`) i **to nie jest dekoracja**.
Formuła `margin` w `initHorizontal` jest tak dobrana, że w chwili, gdy górna krawędź
sekcji dotyka górnej krawędzi okna, tor stoi dokładnie na `x = 0` — bez wcięcia
pierwsza karta leży wtedy przy lewej krawędzi ekranu, czyli swój wjazd i postój
odgrywa jeszcze poniżej okna, a w kadrze pokazuje się już tylko zwinięta. Wcięcie
zabiera jej ten czas z powrotem: start pinu zastaje ją w połowie wjazdu, mniej więcej
w środku ekranu. Zwiększanie `margin` (`HORIZONTAL_MARGIN`) tu nie pomaga, bo zapas
przejazdu i wydłużony zakres triggera znoszą się nawzajem i `x = 0` na starcie pinu
wypada niezależnie od tej stałej. Wcięcie wydłuża tor, więc razem z nim rośnie
wysokość sekcji (`420vh` → `520vh`), żeby tempo przejazdu zostało bez zmian.

Wersja mobilna (`SpecialistsSlider.astro`) nie ma tego mechanizmu: tam karty przesuwa
się palcem, więc nie ma czym sterować progresem.
