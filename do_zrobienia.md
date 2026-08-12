# Do zrobienia

> Lista rzeczy, które w obecnej strukturze projektu będą przeszkadzać w przyszłości.
> Spisana 2026-07-28 na podstawie przeglądu całego `src/`, `public/` i konfiguracji.
> Kolejność = od największego ryzyka. Odhaczaj `[x]` po zrobieniu.

---

## 1. Brak repozytorium git 🔴

**Stan:** jest `.gitignore`, ale nie ma katalogu `.git`. Ok. 2800 linii kodu
na Pulpicie, bez historii i bez możliwości cofnięcia zmian.

**Ryzyko:** jeden nieudany refactor `animacje.js` i nie ma jak wrócić.

**Aktualizacja (panel wpisów):** przestało być opcjonalne. Panel dla pracowników publikuje
wpisy przez GitHub Actions, więc **bez repozytorium na GitHubie panel nie ma jak nic
opublikować**. Kod panelu jest gotowy i przetestowany, czeka wyłącznie na ten punkt.
Szczegóły: `PANEL.md`.

- [ ] `git init` + pierwszy commit całego stanu
- [ ] Prywatne repo na GitHubie — wymagane przez panel wpisów, nie tylko backup

---

## 2. Zero responsywności — ani jednego breakpointu 🔴

**Stan:** w całym `src/` jest **0** wystąpień `sm:` / `md:` / `lg:` / `xl:`.
Układ opiera się na `grid-cols-3`, `grid-cols-2`, `text-[18vw]`, `max-w-[42vw]`
i sekcjach `h-[300vh]` ze sticky pinami. Navbar nie ma menu mobilnego.

`clamp()` skaluje **rozmiary**, ale nie zmienia **układu** — na telefonie trzy
kolumny zdjęć, ściana 5 kolumn logo i talia kart `30vw` się nie obronią.

**Ryzyko:** koszt przeróbki rośnie z każdą nową sekcją.

**Decyzja do podjęcia:** mobile robimy równolegle (sekcja po sekcji, przy okazji
jej budowania) czy jako jedno duże przejście na końcu? Drugie jest dużo droższe.

- [ ] Ustalić strategię (równolegle vs. na końcu)
- [ ] Menu mobilne w `Naglowek.astro`
- [ ] Przegląd sekcji z `grid-cols-*` → układ jednokolumnowy na wąskich ekranach
- [ ] Sprawdzić sticky piny na niskich ekranach (telefon w poziomie)

---

## 3. `index.astro` = cała strona w jednym pliku (693 linie) 🟠

**Stan:** sekcje nie są komponentami, a dane (`uslugi`, `pytania`, `artykuly`,
`liczby`) siedzą w frontmatterze tej jednej strony.
`CONTEXT_AI.md` zakłada `KartaUslugi.astro` / `SekcjaScroll.astro` — rzeczywistość
poszła w drugą stronę.

**Ryzyko:** przy podstronie „Usługi" albo blogu połowę trzeba przenosić ręcznie.

**Aktualizacja (podstrona „O nas"):** problem przestał być teoretyczny. `o-nas.astro`
powiela z `index.astro` cały markup buttona CTA (~10 linii klas × 2 spany), wzorzec
sekcji z pasami (`UPRAWNIENIA` ≈ `LICZBY`) i wzorzec siatki zdjęć z podpisem
(`ZESPÓŁ` ≈ `BLOG`). Przy trzeciej podstronie będzie tego trzy razy tyle.

- [ ] **`Przycisk.astro`** — najpilniejsze, bo markup buttona jest już w 4 miejscach w 3 wariantach kolorystycznych
- [ ] **`SekcjaPasy.astro`** — wspólne dla `LICZBY` i `UPRAWNIENIA` (opcjonalny `data-licznik`)
- [ ] Wydzielić sekcje do komponentów (`Hero`, `ONas`, `ScianaLogo`, `Liczby`, `Uslugi`, `WezwanieDoDzialania`, `Faq`, `Blog`)
- [ ] Dane wyprowadzić z frontmatteru do `src/dane/` (albo content collections)
- [x] Blog → **content collection** (`src/content/blog/`), nie tablica w indeksie. Schemat w `src/content.config.mjs`, pomocniki w `src/data/blog.js`, opis w `BLOG.md`

---

## 4. Hardkodowane kolory ✅ zrobione

**Było:** 312 wystąpień hexów (`#E7F5CD`, `#2b3637`, `#1B1710`, `#dbe1ea`, `#d0efba`,
`#ff4b3e`) w klasach Tailwinda, w `global.css` i w JS-ie.

**Jest:** 7 tokenów w bloku `@theme static` w `src/styles/global.css` — jedyne miejsce
z wartościami kolorów w całym projekcie. Opis: `KOLORY.md`.

- [x] Tokeny w `@theme static` w `global.css` (`--color-canvas`, `--color-canvas-deep`, `--color-ink`, `--color-graphite`, `--color-placeholder`, `--color-alert`, `--color-grid`)
- [x] Podmienione 302 wystąpienia na `bg-canvas` / `text-graphite` / `border-ink` itd.
- [x] Cienie jako tokeny `--shadow-lift` i `--shadow-panel` (liczone z `--color-ink`)
- [x] Kolory w `animacje.js` czytane z tokenów przez `colorToken()`, a `reveal-panel` przez `--page-background`

---

## 5. Obrazy — 13,9 MB w `/public`, w tym śmieci 🟠

**Stan:**
- `hero.png` — **13,3 MB**, **nieużywany** (hero to szary placeholder `bg-placeholder`)
- `logo.jpg` — 47 KB, **nieużywany**
- `epxLOGO-bez-tla.png` — 283 KB, `greenvitoLOGO-bez-tla.png` — 169 KB
- wszystkie logo idą jako surowe `<img src="/...">` z `/public`, czyli **omijają `astro:assets`** — brak webp/avif, brak `width`/`height` (→ CLS)

Wszystko to jest kopiowane do `dist/` przy każdym buildzie.

**Ryzyko:** priorytet projektu to Core Web Vitals — to najtańszy duży zysk.

- [ ] Usunąć `hero.png` i `logo.jpg` (albo przenieść poza `/public`, jeśli mają być źródłem)
- [ ] Logo klientów przenieść do `src/assets/` i renderować przez `<Image />` z `astro:assets`
- [ ] Skompresować `epxLOGO-bez-tla.png` i `greenvitoLOGO-bez-tla.png`
- [ ] Zostawić w `/public` tylko to, co musi mieć stałą ścieżkę (favicon, og)

---

## 6. `og:image` wskazuje na nieistniejący plik 🟠

**Stan:** `BaseLayout.astro:23` ustawia domyślnie `image = '/og-default.jpg'`,
a tego pliku nie ma w `/public`.

**Ryzyko:** każdy link do strony wrzucony na FB / LinkedIn / Slack / WhatsApp
będzie bez podglądu.

- [ ] Zrobić `og-default.jpg` (1200×630) i wrzucić do `/public`

---

## 7. `text-box-trim` nie działa w Firefoksie 🟡

**Stan:** klasa `.text-trim` (`global.css:27`) używa `text-box-trim` / `text-box-edge`.
Wspiera to Chrome 133+ i Safari 18.2+, **Firefox nie**.

Używane w: hero („BIURO" / „MAZUR" wyrównane do zdjęcia) i w licznikach sekcji „Liczby".

**Ryzyko:** w Firefoksie zostaje dodatkowy odstęp nad i pod literami — hero się rozjeżdża.

- [ ] Decyzja: fallback (`@supports` + ręczne `leading`/`mt` ujemne) czy świadome „trudno"
- [ ] Jeśli fallback — dopisać do `animacje.md` jako konwencję

---

## 8. Nawigacja zduplikowana i cała na `href="#"` 🟡

**Stan:**
- `Naglowek.astro:8` → `['start', 'o nas', 'usługi', 'cennik']`
- `Stopka.astro:27` → `['start', 'o nas', 'usługi', 'cennik', 'blog', 'kontakt']` (inna lista!)
- 10 martwych `href="#"` w sumie (2 navbar, 3 stopka, 5 index)
- link „o nas" w indeksie wskazuje `#o-nas`, czyli sam na siebie

**Ryzyko:** przy dodawaniu podstron listy będą się rozjeżdżać dalej.

- [x] Jedno źródło prawdy: `src/dane/nawigacja.js` (etykieta + `href`) — zrobione przy podstronie „O nas"
- [x] `Naglowek` i `Stopka` czytają z niego — plus `aria-current="page"` na bieżącej stronie
- [x] `/o-nas` podpięte wszędzie (navbar, stopka, link w sekcji O NAS na głównej)
- [x] `/uslugi` i `/kontakt` podpięte; `cennik` usunięty z nawigacji i z podstron
- [x] `blog` wskazuje `/blog`. Wszystkie pozycje nawigacji mają już realne ścieżki
- [ ] **Wyróżnienie aktywnej pozycji w navbarze** — semantyka (`aria-current`) już jest, ale wizualnie nic się nie zmienia. Do decyzji razem z Figmą

---

## 9. Wydajność scrolla i przeliczanie triggerów 🟡

**Stan:**
- Sumaryczna wysokość pinów: **~1450vh** (300 + 220 + 350 + 320 + 260 stopka).
  Na 4K vs. laptopie to skrajnie różna liczba obrotów kółka.
- `inicjalizujRevealObrazkow` (`animacje.js:248`) liczy delay z `getBoundingClientRect()`
  **raz, przy inicjalizacji** — po resize nie przelicza. Tylko `inicjalizujKarteczki`
  ma `invalidateOnRefresh: true`.
- `inicjalizujFaq` (`animacje.js:613`) woła pełny `ScrollTrigger.refresh()` przy
  **każdym** otwarciu pytania — przy tylu triggerach to coraz droższe.

- [ ] Dodać `invalidateOnRefresh` tam, gdzie liczone są wartości z okna
- [ ] Zamiast pełnego `refresh()` po FAQ — węższe odświeżenie (albo `refresh()` z debounce)
- [ ] Sprawdzić długość pinów na dużym monitorze; rozważyć wysokości zależne od `vh` treści

---

## 10. Dokumentacja się rozjeżdża 🟡

**Stan:**
- `CLAUDE.md` i `AGENTS.md` to **fizycznie ten sam plik** (hardlink) z domyślnym
  szablonem Astro — nie ma tam żadnych realnych zasad projektu.
- Realne konwencje żyją w `CONTEXT_AI.md` i `animacje.md`, których nic nie ładuje
  automatycznie.
- `animacje.js:8` mówi „Respektujemy prefers-reduced-motion", a `animacje.js:38`
  mówi że **nie** — komentarz nieaktualny.

**Ryzyko:** konwencje (vw+clamp, GSAP zamiast IntersectionObserver, brak hoverów bez prośby)
muszą być przypominane przy każdej sesji.

- [ ] Przenieść realne zasady do `CLAUDE.md` (albo dopisać w nim odesłania do `CONTEXT_AI.md` i `animacje.md`)
- [ ] Poprawić nieaktualny komentarz w `animacje.js:8`
- [ ] Zdecydować, czy `AGENTS.md` ma zostać hardlinkiem (edycja jednego zmienia drugi)

---

## 11. Niespójny easing w buttonach 🟡

**Stan:** easingi w projekcie są w całości stockowe (GSAP `power2/3/4`, Tailwind
`ease-out`) i użyte konsekwentnie: `.out` na wjazdach, `.in` na wyjazdach,
`.inOut` na dużych maskach, `none` na wszystkim scrubowanym. **Poza jednym miejscem.**

W buttonach (hero `index.astro:185-186`, CTA `index.astro:519-520`, stopka
`Stopka.astro:63-64`) dwa ruchome elementy jadą na **dwóch różnych krzywych**:

```
napis:  transition-all duration-[400ms]  group-hover:translate-x-[1.2vw]   ← brak ease-* → ease-in-out (domyślny Tailwinda)
kółko:  transition-transform duration-700 ease-out group-hover:scale-[55]  ← ease-out
```

Napis przesuwa się `ease-in-out`, kółko rozlewa się `ease-out` — w tym samym geście.

Pozostałe 13 przejść bez klasy `ease-*` to zmiany koloru i obramowania, gdzie krzywa
jest praktycznie niewidoczna — tam nie ma o co kruszyć kopii.

- [x] CTA na podstronie „O nas" (`o-nas.astro`) — od razu z `ease-out`
- [ ] Dodać `ease-out` do napisu w pozostałych 3 buttonach (hero i CTA na `index.astro`, stopka)

---

## 12. Elementy widoczne, zanim odpali się GSAP (miganie + CLS) 🟠

**Stan:** element, który GSAP chowa dopiero w `setup()`, jest w pełni widoczny od
pierwszego malowania aż do wykonania bundla (GSAP + Lenis to sporo kilobajtów).
Efekt: mrugnięcie przy każdym wejściu na stronę, a przy zmianach wysokości — skok układu.

Zrobione:
- [x] **Panel formularza** — dostał maskę `clip-path` w klasie (2026-07-28). Wcześniej
      cały ciemny panel migał przy każdym wczytaniu strony

Zostaje, w kolejności szkodliwości:
- [ ] **Odpowiedzi FAQ** (`data-faq-odpowiedz`) — GSAP ustawia `height: 0`, ale w HTML nie
      ma nic, więc **wszystkie 5 odpowiedzi jest rozwiniętych** na pierwszym malowaniu
      i zwija się dopiero po JS. To nie tylko mrugnięcie, to spory **CLS** na stronie
      głównej — a Core Web Vitals są priorytetem projektu
- [ ] **`.reveal-line`** — GSAP ustawia `yPercent: 110`, w HTML nic. Nagłówki są widoczne
      na docelowej pozycji, po czym przeskakują pod maskę i animują się od nowa
- [ ] **`.headline-line`** — to samo w sekcjach pinowanych

**⚠️ Decyzja do podjęcia, dlatego nie zrobione od ręki:** przy formularzu ukrycie w CSS
jest bezpieczne (to modal, bez JS i tak nie działa). Przy nagłówkach i FAQ oznacza, że
**bez JS treść jest niewidoczna dla użytkownika**. W HTML zostaje, więc Google ją widzi,
ale człowiek z zablokowanym JS-em — nie. Do wyboru:
- ukryć w CSS (koniec migania i CLS, ale zależność od JS),
- albo `<noscript>` z regułą przywracającą widoczność (rozwiązuje oba, kosztem kilku linii).

---

## 13. Drobne 🟢

- [x] **React nieużywany** — przestał być nieużywany. Panel wpisów pod `/panel` to
      wyspa `client:only="react"` (`src/components/panel/`), czyli dokładnie ten punktowy
      przypadek, o który React był w projekcie trzymany
- [ ] **Brak JSON-LD `LocalBusiness`** — było w planie SEO (`CONTEXT_AI.md`), nie ma
- [x] **Brak `robots.txt`** — jest, z `Disallow: /panel` i odesłaniem do sitemapy
- [ ] **`body` ma `text-slate-900`** (`BaseLayout.astro:63`) nadpisywane wszędzie — martwe
- [ ] **Formularz bez backendu** (znany TODO w `animacje.js:899`) — do tego brak honeypota
      i jakiegokolwiek zabezpieczenia przed botami
- [ ] **`prefers-reduced-motion` ignorowany** — decyzja świadoma (`CONTEXT_AI.md`),
      ale to WCAG 2.3.3. Warto odnotować, jeśli strona firmowa ma przechodzić audyt

---

## Kolejność, którą proponuję

1. **git init** (pkt 1) — zanim tkniemy cokolwiek innego
2. **Tokeny kolorów** (pkt 4) — im później, tym więcej miejsc do podmiany
3. **Obrazy + og-default** (pkt 5, 6) — tanie, duży zysk dla Core Web Vitals

Potem decyzje kierunkowe: **mobile** (pkt 2) i **rozbicie `index.astro`** (pkt 3).
Obie kosztują teraz, ale rosną wykładniczo z każdą nową sekcją.
