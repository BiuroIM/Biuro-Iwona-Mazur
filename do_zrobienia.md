# Do zrobienia

> Dług techniczny, który będzie przeszkadzał w przyszłości. Spisany 2026-07-28,
> przepisany 2026-09-14 po usunięciu pozycji już zrobionych (git, responsywność,
> tokeny kolorów, obrazy, `og-default.jpg`, nawigacja z jednego źródła,
> rozbicie `animations.js`).
>
> Rzeczy blokujące start są w osobnym pliku: `PRZED_PUBLIKACJA.md`.

---

## 1. `index.astro` = cała strona w jednym pliku (809 linii) 🟠

Sekcje nie są komponentami, a dane (`uslugi`, `pytania`, `artykuly`, `liczby`)
siedzą w frontmatterze tej jednej strony. Reszta podstron ma 66–302 linie.

`o-nas.astro` powiela z `index.astro` markup buttona CTA (~10 linii klas × 2 spany),
wzorzec sekcji z pasami (`UPRAWNIENIA` ≈ `LICZBY`) i wzorzec siatki zdjęć z podpisem
(`ZESPÓŁ` ≈ `BLOG`). Przy czwartej podstronie będzie tego cztery razy tyle.

- [ ] `Button.astro` — najpilniejsze, markup buttona jest w 4 miejscach w 3 wariantach
- [ ] `StripeSection.astro` — wspólne dla `LICZBY` i `UPRAWNIENIA`
- [ ] Wydzielić sekcje do komponentów (`Hero`, `About`, `LogoWall`, `Numbers`,
      `Services`, `CallToAction`, `Faq`, `Blog`)
- [ ] Dane z frontmatteru do `src/data/`

---

## 2. Elementy widoczne, zanim odpali się GSAP (miganie + CLS) 🟠

Element, który GSAP chowa dopiero w `setup()`, jest widoczny od pierwszego malowania
aż do wykonania bundla. Efekt: mrugnięcie przy wejściu, a przy zmianach wysokości skok układu.

- [ ] **Odpowiedzi FAQ** (`data-faq-answer`) — GSAP ustawia `height: 0`, w HTML nie ma nic,
      więc wszystkie odpowiedzi są rozwinięte na pierwszym malowaniu. Spory CLS na stronie
      głównej, a Core Web Vitals są priorytetem projektu
- [ ] **`.reveal-line`** — GSAP ustawia `yPercent: 110`, w HTML nic. Nagłówki są widoczne
      na docelowej pozycji, po czym przeskakują pod maskę
- [ ] **`.headline-line`** — to samo w sekcjach pinowanych

**Decyzja do podjęcia:** ukrycie w CSS kończy miganie i CLS, ale bez JS treść jest
niewidoczna dla człowieka (Google ją widzi, bo zostaje w HTML). Alternatywa to
`<noscript>` z regułą przywracającą widoczność — rozwiązuje oba, kosztem kilku linii.
W `BaseLayout.astro` nie ma dziś żadnego `<noscript>`.

---

## 3. Wydajność scrolla i przeliczanie triggerów 🟡

- Sumaryczna wysokość pinów: ~1450vh. Na 4K vs. laptopie to skrajnie różna liczba
  obrotów kółka.
- `initImageReveal` (`animations/reveal.js`) liczy delay z `getBoundingClientRect()`
  raz, przy inicjalizacji — po resize nie przelicza.
- `initFaq` (`animations/faq.js:27`) woła pełny `ScrollTrigger.refresh()` przy każdym
  otwarciu pytania — przy tylu triggerach to coraz droższe.

- [ ] `invalidateOnRefresh` tam, gdzie liczone są wartości z okna
- [ ] Zamiast pełnego `refresh()` po FAQ — węższe odświeżenie albo `refresh()` z debounce
- [ ] Sprawdzić długość pinów na dużym monitorze

---

## 4. `text-box-trim` nie działa w Firefoksie 🟡

Klasa `.text-trim` (`global.css`) używa `text-box-trim` / `text-box-edge`.
Wspiera to Chrome 133+ i Safari 18.2+, Firefox nie. Używane w hero
(„BIURO" / „MAZUR" wyrównane do zdjęcia) i w licznikach sekcji „Liczby".
W Firefoksie zostaje dodatkowy odstęp nad i pod literami.

- [ ] Decyzja: fallback (`@supports` + ręczne `leading`) czy świadome „trudno"
- [ ] Jeśli fallback — dopisać do `animacje.md` jako konwencję

---

## 5. Niespójny easing w buttonach 🟡

W buttonach (`index.astro:137`, `index.astro:603`, `Footer.astro:43`) dwa ruchome
elementy jadą na dwóch różnych krzywych: napis ma `transition-all duration-[400ms]`
bez klasy `ease-*`, czyli domyślne `ease-in-out`, a kółko `duration-700 ease-out`.
Reszta projektu trzyma się konsekwentnie `.out` na wjazdach i `.in` na wyjazdach.

- [ ] Dodać `ease-out` do napisu w tych trzech buttonach

---

## 6. Drobne 🟢

- [ ] **Wyróżnienie aktywnej pozycji w navbarze** — `aria-current` już jest,
      ale wizualnie nic się nie zmienia
- [ ] **`prefers-reduced-motion` ignorowany** — decyzja świadoma, ale to WCAG 2.3.3.
      Warto odnotować, jeśli strona ma przechodzić audyt
- [ ] **Limit zgłoszeń z formularza / captcha** — reszta obiegu opisana w `FORMULARZ.md`
