# Panel wpisów dla pracowników

> Jak pracownik biura dodaje wpis na bloga bez dostępu do kodu i bez znajomości Markdowna.
> Opis samego bloga i pól wpisu: `BLOG.md`.

## Skąd ten kształt rozwiązania

Strona jest statyczna. Nie ma serwera, który mógłby pokazać wpis zapisany w bazie,
więc **każdy nowy wpis wymaga przebudowania strony i wysłania jej na home.pl**.
Panel sam z siebie nic nie opublikuje. Publikuje dopiero pipeline pod nim.

Obieg wygląda tak:

```
pracownik → /panel (przeglądarka) → Supabase (baza + zdjęcia)
                                        │
                                        │ trigger SQL (pg_net)
                                        ▼
                                 GitHub Actions
                                        │
                          sync-blog.mjs │ pobiera wpisy → pliki .md
                                        │ astro build
                                        ▼
                                  FTP → home.pl
```

Od kliknięcia „Opublikuj" do wpisu widocznego na stronie mija **kilka minut** (czas
builda i wysyłki). Pracownik widzi o tym komunikat w panelu, żeby nie odświeżał bloga
w nieskończoność.

## Dwa warianty publikacji

Panel, baza i generowanie plików `.md` są wspólne. Różnica jest w tym, **kto uruchamia build**.

| | Wariant A: GitHub Actions | Wariant B: własny komputer |
| --- | --- | --- |
| Uruchamia build | serwer GitHuba, po sygnale z bazy | Ty, komendą `npm run publish` |
| Wpis pojawia się | kilka minut po kliknięciu, zawsze | dopiero gdy odpalisz skrypt (można z harmonogramu) |
| Wymaga | repo na GitHubie | niczego poza tym, co już masz |
| Działa gdy Twój komputer jest wyłączony | tak | **nie** |
| Kopia i historia kodu | tak, przy okazji | nie, trzeba zadbać osobno |

Wariant B jest opisany w sekcji „Publikacja bez GitHuba" na końcu. Warto go znać nawet
przy wariancie A, bo to gotowa droga awaryjna, gdy Actions przestanie działać.

**Wpisy zostają zwykłymi plikami `.md` w repozytorium.** `sync-blog.mjs` zamienia rekordy
z bazy na pliki w `src/content/blog/`, a workflow commituje je z powrotem. Dzięki temu
schemat kolekcji, spis treści, `<Image>` i sekcja „Czytaj dalej" działają bez żadnej
zmiany, a treść jest w dwóch miejscach naraz. Gdyby Supabase kiedyś zniknął, wpisy
zostają w repo.

## Co leży gdzie

| Plik | Rola |
| --- | --- |
| `supabase/schema.sql` | tabela `posts`, uprawnienia RLS, kubełek na zdjęcia, trigger uruchamiający build |
| `src/pages/panel.astro` | strona `/panel`. Osobny layout, bez GSAP i Lenisa, `noindex` |
| `src/components/panel/PanelApp.jsx` | logowanie i przełączanie widoków |
| `src/components/panel/PanelLogin.jsx` | ekran logowania |
| `src/components/panel/PanelList.jsx` | lista wpisów z akcjami Edytuj, Ukryj, Usuń |
| `src/components/panel/PanelForm.jsx` | formularz wpisu, pasek narzędzi, podgląd |
| `src/components/panel/styles.js` | wspólne klasy Tailwinda dla panelu |
| `src/lib/supabaseClient.js` | klient Supabase dla przeglądarki |
| `src/lib/slug.js` | tytuł → adres wpisu, z polskimi znakami |
| `scripts/sync-blog.mjs` | baza → pliki `.md` i zdjęcia w `src/assets/blog/` |
| `scripts/publish.mjs` | wariant B: build i przyrostowa wysyłka na FTP z własnego komputera |
| `scripts/generated-posts.json` | które pliki `.md` pochodzą z panelu. **Nie edytować ręcznie** |
| `.github/workflows/deploy.yml` | build i wysyłka na home.pl |
| `.github/workflows/supabase-keepalive.yml` | codzienny strzał do bazy, żeby Supabase jej nie uśpił |

## Uruchomienie od zera

Rzeczy, których nie da się zrobić z kodu. Kolejność ma znaczenie.

### 1. Repozytorium git ✅ zrobione

Kod leży w prywatnym repozytorium **`BiuroIM/Biuro-Iwona-Mazur`**, gałąź `main`.
Właścicielem jest konto `BiuroIM`, czyli konto firmowe, a nie prywatne konto osoby
technicznej. Z rzeczy, które łatwo przeoczyć przy kolejnych zmianach:

- gałąź musi nazywać się `main`, bo na nią nasłuchuje `deploy.yml`,
- `.claude/settings.local.json` i `scripts/publish-state.json` są w `.gitignore`,
  bo to pliki jednej maszyny, nie projektu,
- `.env` **nigdy** nie trafia do repo. Sekrety produkcyjne żyją w ustawieniach GitHuba.

`BiuroIM` jest kontem osobowym, nie Organizacją. Dla jednej firmy jest to dopuszczalne
(regulamin dopuszcza jedno darmowe konto na osobę **lub podmiot prawny**), pod warunkiem
że **nie dajesz tego samego loginu kilku osobom**. Gdy do projektu wejdzie druga osoba
techniczna, dodaj ją jako collaboratora na jej własnym koncie, a nie przez podanie hasła.
GitHub pozwala też później przekształcić konto w Organizację bez przenoszenia repozytorium.

```
git init
git add .
git commit -m "Stan strony przed uruchomieniem panelu"
```

Potem **prywatne** repo na GitHubie i `git remote add origin ...` plus `git push -u origin main`.
Prywatne, bo w historii będą treści klienta.

**Repozytorium ma należeć do darmowej Organizacji, nie do konta osobistego.** Strona jest
majątkiem biura, więc nie powinna wisieć na prywatnej tożsamości jednej osoby. Ludzie
wchodzą do organizacji własnymi kontami, każdy ze swoim 2FA. Wspólne konto z jednym hasłem
jest wprost zabronione w regulaminie GitHuba („a single login may not be shared by multiple
people") i uniemożliwia sprawdzenie, kto co zmienił.

GitHub Free dla organizacji ma prywatne repozytoria i te same 2000 minut Actions
miesięcznie co konto osobiste, więc nie kosztuje nic więcej.

Warto od razu dodać drugiego ownera po stronie biura. Wtedy odejście osoby technicznej
nie odcina firmy od własnej strony.

**Pracownicy piszący wpisy nie potrzebują żadnego konta GitHub.** Logują się do `/panel`
przez Supabase.

### 2. Projekt w Supabase ✅ schemat wgrany

Projekt: **`lunzovafldmhbgxtrwom`**, adres API `https://lunzovafldmhbgxtrwom.supabase.co`.
Ta sama zasada co przy GitHubie: projekt trzymaj na **adresie firmowym**, nie prywatnym,
i dodaj do organizacji Supabase drugą osobę z biura. Inaczej baza z treściami klienta
wisi na prywatnym koncie.

Punkty 1 i 2 są **zrobione** (schemat wgrany jako migracje `blog_panel_schema`,
`harden_private_schema` i `restrict_pg_net_access`). Zostają punkty 3 do 6.

1. `supabase.com` → nowy projekt (region Frankfurt, najbliżej).
2. SQL Editor → wklej całą zawartość `supabase/schema.sql` → Run.
3. **Authentication → Sign In / Providers → Email**: zostaw włączone.
4. **Authentication → Sign Up**: wyłącz możliwość samodzielnej rejestracji.
   Inaczej każdy z internetu założy sobie konto i będzie pisał na blogu.
5. **Authentication → Users → Add user**: po jednym koncie na pracownika,
   e-mail plus hasło, z zaznaczonym automatycznym potwierdzeniem.
6. **Project Settings → API**: skopiuj `Project URL` i klucz `anon public`.

### 3. Token GitHuba dla Supabase ✅ zrobione (tylko wariant A)

Trigger w bazie musi umieć poprosić GitHuba o build. Token jest już w `private.app_settings`,
a cała ścieżka sprawdzona: zapis wpisu w bazie kończy się odpowiedzią `204` od GitHuba.
Poniższy opis zostaje na wypadek wymiany tokena po wygaśnięciu.

1. **Zaloguj się na konto, które jest właścicielem repozytorium** (`BiuroIM`), nie na swoje
   prywatne. Token fine-grained widzi wyłącznie repozytoria należące do konta, które go
   wystawiło, więc token współpracownika po prostu nie zobaczy tego repo.
2. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.
3. Resource owner: `BiuroIM`. Dostęp tylko do repozytorium `Biuro-Iwona-Mazur`,
   uprawnienie **Contents: Read and write**.
4. W Supabase, w SQL Editor:

```sql
insert into private.app_settings (key, value) values
  ('github_repo', 'BiuroIM/Biuro-Iwona-Mazur'),
  ('github_token', 'github_pat_...')
on conflict (key) do update set value = excluded.value;
```

Tabela z tokenem leży w schemacie `private`, którego **PostgREST w ogóle nie wystawia**,
i dodatkowo ma włączony RLS bez żadnej polityki. Odpytanie jej z zewnątrz kończy się
błędem 404, bo dla świata ta tabela nie istnieje. Trigger czyta ją jako `security definer`,
czyli z uprawnieniami właściciela.

Jeżeli trigger dostaje `Resource not accessible by personal access token`, to znana
bolączka tokenów fine-grained przy `repository_dispatch`. Wystaw wtedy **token klasyczny**
(Tokens (classic)) z zakresem `repo` i podmień wartość `github_token`. Diagnostyka
odpowiedzi jest opisana niżej, w sekcji o wpisie, który się nie pojawia.

### 4. Sekrety w GitHubie (tylko wariant A)

Settings → Secrets and variables → Actions.

**Secrets:**

| Nazwa | Wartość |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | `Project URL` z Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | klucz `anon public` |
| `FTP_SERVER` | serwer FTP z panelu home.pl, np. `ftp.biuro-mazur.pl` |
| `FTP_USERNAME` | login FTP |
| `FTP_PASSWORD` | hasło FTP |

**Variables:**

| Nazwa | Wartość |
| --- | --- |
| `FTP_SERVER_DIR` | katalog strony na serwerze, ze slashem na końcu |

`FTP_SERVER_DIR` trzeba sprawdzić w panelu home.pl. Bywa `/`, bywa `/public_html/`,
przy wielu domenach na jednym koncie bywa `/biuro-mazur.pl/`. **Wpisanie złego katalogu
wysypie pliki strony w niewłaściwe miejsce**, więc pierwszy deploy warto obejrzeć.

Jeżeli wysyłka zerwie się na szyfrowaniu, zmień w `deploy.yml` `protocol: ftps`
na `protocol: ftp`.

### 5. Lokalnie

`.env` w katalogu projektu (jest w `.gitignore`, nie trafi do repo):

```
PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
PUBLIC_SUPABASE_ANON_KEY=twoj-klucz-anon
```

Wzór leży w `.env.example`. Po dopisaniu `.env` **zrestartuj serwer dev**, bo Astro czyta
zmienne tylko przy starcie:

```
astro dev stop
astro dev --background
```

Bez `.env` panel pod `/panel` pokaże komunikat, że nie jest podłączony, a `sync:blog`
grzecznie się pominie. Reszta strony działa normalnie.

## Instrukcja dla pracownika

Do przekazania osobom, które będą pisać. Bez słowa o Markdownie, bo nie muszą go znać.

1. Wejdź na `biuro-mazur.pl/panel` i zaloguj się swoim e-mailem i hasłem.
2. Kliknij **Napisz nowy wpis**.
3. Wypełnij:
   - **Tytuł wpisu** z niego powstaje adres wpisu,
   - **Wprowadzenie** jedno albo dwa zdania, widoczne na liście wpisów i w Google,
   - **Kategoria** z listy,
   - **Zdjęcie okładki** plik JPG lub PNG do 8 MB,
   - **Opis zdjęcia** co na nim widać,
   - **Treść wpisu**.
4. W treści: zaznacz fragment i kliknij **Pogrubienie** albo **Link**. Ustaw kursor
   w linii i kliknij **Nagłówek**, żeby zrobić z niej tytuł sekcji, albo **Lista**,
   żeby zrobić punkt. **Podejrzyj** pokazuje wpis tak, jak wyjdzie na stronie.
5. **Opublikuj wpis**. Na blogu pojawi się w ciągu kilku minut.

Na liście wpisów są jeszcze dwie rzeczy: **Ukryj** zdejmuje wpis ze strony, nie usuwając
go z panelu (przydaje się, gdy trzeba coś szybko wycofać), a **Usuń** usuwa nieodwracalnie.

**Tytuł istniejącego wpisu można zmieniać, adres zostaje ten sam.** Tak ma być: adres
raz opublikowany zostaje na stałe, żeby nie psuć linków, które ktoś już zapisał albo
wysłał klientowi.

## Co dopisuje się samo

Pracownik nie widzi tych pól, a schemat kolekcji ich wymaga:

| Pole | Skąd się bierze |
| --- | --- |
| `date` | moment publikacji z bazy |
| `readingMinutes` | liczba słów dzielona przez `WORDS_PER_MINUTE` z `src/lib/postStructure.js`, minimum 1 |
| `cover` | zdjęcie ściągnięte do `src/assets/blog/<adres>.jpg` |
| `softParallax` | zawsze `true` |
| `featured` | nigdy nie ustawiane. Wyróżniony wpis to sprawa techniczna, opis w `BLOG.md` |

## ⚠️ Czas czytania rozjeżdża się ze starymi wpisami

Siedem wpisów napisanych ręcznie ma `readingMinutes` wpisane z palca i wynika z nich tempo
**76 słów na minutę**. Panel liczy po **200**, czyli realistycznie. Efekt: tekst o tej samej
długości dostanie z panelu „2 min czytania", a sąsiedni stary wpis pokazuje „7 min czytania",
i widać to obok siebie na liście.

| Wpis | Słów | Wpisane ręcznie | Wynikowe tempo |
| --- | --- | --- | --- |
| `bledy-w-ewidencji-vat` | 425 | 5 min | 85 słów/min |
| `forma-opodatkowania-jak-wybrac` | 498 | 8 min | 62 słowa/min |
| `ksef-w-praktyce` | 482 | 7 min | 69 słów/min |
| `zmiany-w-skladce-zdrowotnej` | 519 | 6 min | 87 słów/min |

Do wyboru, jedno albo drugie:

- **Zostawić 200** i poprawić siedem starych wpisów, żeby mówiły prawdę. Wtedy wszystkie
  artykuły na blogu skracają się do 2 do 3 minut.
- **Zejść do tempa starych wpisów**, zmieniając `WORDS_PER_MINUTE` w `src/lib/postStructure.js`
  na 80. Nowe wpisy dopasują się do tego, co już jest, kosztem zawyżonej liczby.

Teraz obowiązuje pierwszy wariant, ale stare wpisy **nie są jeszcze poprawione**, więc
niespójność istnieje. Ta stała jest w jednym miejscu i liczy tak samo w panelu i przy
publikacji, więc zmiana to jedna linia.

## Wpisy z panelu a wpisy pisane ręcznie

Jedno i drugie działa równolegle. Siedem wpisów, które są w repo teraz, zostaje
plikami pisanymi ręcznie i panel ich nie widzi. `sync-blog.mjs` rusza **wyłącznie**
pliki wymienione w `scripts/generated-posts.json`.

Gdyby wpis z panelu dostał adres taki jak istniejący plik, **build się zatrzymuje**
z komunikatem, który plik jest w konflikcie. Skrypt woli zerwać build niż nadpisać
cudzą treść.

## Bezpieczeństwo

**Klucz `anon` jest publiczny i tak ma być.** Widać go w kodzie strony. Nie daje on
niczego poza prawem do próby zalogowania i do czytania opublikowanych wpisów, bo dostęp
pilnują polityki RLS z `schema.sql`: pisać i edytować może wyłącznie zalogowany
użytkownik, a kont nie da się zakładać samodzielnie (o ile wyłączysz rejestrację
w punkcie 2.4, **to nie jest opcjonalne**).

**Dlaczego jest schemat `private`.** Pierwsza wersja schematu trzymała `app_settings`
i funkcje triggerów w `public`. Audyt Supabase (`get_advisors`) pokazał dwie realne dziury:
PostgREST wystawiał funkcję `request_site_rebuild` jako endpoint `/rest/v1/rpc/...`, więc
**każdy z publicznym kluczem mógł w pętli wyzwalać buildy** i wypalić limit minut GitHuba,
a rola `anon` miała uprawnienie SELECT na tabeli z tokenem (RLS to blokował, ale to jedna
nieuważna polityka od wycieku). Oba obiekty przeniesione do schematu `private`, którego
PostgREST nie wystawia. Sprawdzone od zewnątrz: oba adresy zwracają 404, zapis bez
logowania 401, a w schemacie `public` nie ma **ani jednej** funkcji.

**Nie przenoś tych rzeczy z powrotem do `public`** przy kolejnych zmianach schematu.

Zostaje jedno ostrzeżenie audytu: `pg_net` jest zarejestrowane w schemacie `public`.
Zostawione świadomie, bo wszystkie 12 funkcji rozszerzenia leży w schemacie `net`,
w `public` nie ma żadnej, a `anon` i `authenticated` mają odebrany dostęp do `net`.
Próba przeniesienia samego rozszerzenia mogłaby przestawić `net.http_post`, od którego
zależy publikacja, i nie dałaby nic w zamian.

Czego świadomie nie ma:

- **Brak akceptacji przed publikacją** ustalone tak przy wdrożeniu. Wpis idzie na stronę
  od razu. Bezpiecznikiem jest przycisk **Ukryj**, który zdejmuje wpis ze strony przy
  kolejnym buildzie.
- **Wszyscy zalogowani mają te same prawa**, czyli każdy może edytować i usuwać cudze
  wpisy. Kto co napisał, widać w kolumnie `author_email`.
- **Treść wpisu nie jest sanityzowana.** Podgląd renderuje HTML z Markdowna zaufanego
  autora. Panel jest za loginem, więc to świadome uproszczenie, ale nie dawaj do niego
  dostępu osobom postronnym.

## Usypianie darmowego Supabase

Darmowy projekt Supabase jest **usypiany po tygodniu bez ruchu w bazie**. Dla bloga
z kilkoma wpisami w miesiącu to znaczy, że pracownik trafiłby na martwe logowanie.
Dane nie giną, ale projekt trzeba wtedy odpauzować ręcznie w panelu Supabase.

Dlatego jest `supabase-keepalive.yml`: raz na dobę pyta bazę o jeden wiersz i to
wystarcza, żeby liczyła się jako używana. Jeżeli projekt i tak zostanie uśpiony,
sprawdź, czy ten workflow nie jest wyłączony (GitHub wyłącza cykliczne workflowy
w repozytoriach, do których nikt nic nie wypchnął od 60 dni).

Alternatywa bez tej gimnastyki to plan Pro w Supabase, który nie usypia projektów.

## Gdy wpis nie pojawia się na stronie

Po kolei, od najczęstszej przyczyny:

1. **GitHub → Actions** czy build w ogóle wystartował. Jeżeli nie, trigger w bazie
   nie doleciał do GitHuba. W Supabase, w SQL Editor:

   ```sql
   select status_code, content from net._http_response order by created desc limit 5;
   ```

   `401` albo `403` to zły albo wygasły token w `app_settings`. `404` to zła nazwa repo.

2. **Build wystartował i padł** przeczytaj log kroku. Najczęściej brakuje sekretu
   albo wpis z panelu koliduje adresem z plikiem pisanym ręcznie.

3. **Build przeszedł, a na stronie nic** to znaczy, że FTP wysłał pliki w inny katalog.
   Sprawdź `FTP_SERVER_DIR`.

4. **Wpis jest, ale bez zdjęcia** sprawdź, czy kubełek `covers` w Supabase Storage
   jest publiczny.

Build można też odpalić ręcznie: **Actions → Build and deploy → Run workflow**.

## Publikacja bez GitHuba

Wariant B. Build robi Twój komputer, a `scripts/publish.mjs` wysyła wynik na home.pl.
Nie potrzebujesz wtedy ani repozytorium, ani tokenów, ani sekretów. Z kroków
„Uruchomienia od zera" zostają tylko **2 (Supabase)** i **5 (`.env`)**, a w Supabase
pomijasz wpisy do `app_settings`, bo nie ma czego powiadamiać.

Do `.env` dochodzą dane z panelu home.pl:

```
FTP_HOST=ftp.biuro-mazur.pl
FTP_USER=login-ftp
FTP_PASSWORD=haslo-ftp
FTP_DIR=/
```

Publikacja to jedna komenda:

```
npm run publish
```

Skrypt po kolei: pobiera wpisy z panelu, buduje stronę, porównuje ją z tym, co wysłał
poprzednio, i **wysyła wyłącznie zmienione pliki**. To nie jest ozdoba: `dist` waży
66 MB, a jeden nowy wpis zmienia około 20 plików ze 124. Bez tego każda publikacja
oznaczałaby przepychanie kilkudziesięciu megabajtów przez FTP.

Stan ostatniej wysyłki leży w `scripts/publish-state.json` i jest **lokalny**
(w `.gitignore`). Gdy go skasujesz, następna publikacja wyśle wszystko od nowa, co jest
też sposobem na naprawę sytuacji, w której pliki na serwerze rozjechały się z tym,
co powinno tam być.

### Automat z Harmonogramu zadań

Żeby pracownik nie czekał na Ciebie, Windows może odpalać publikację co kwadrans.
Harmonogram zadań → Utwórz zadanie podstawowe → wyzwalacz „codziennie", potem
w ustawieniach zaawansowanych powtarzanie co 15 minut. Akcja:

```
Program:    cmd.exe
Argumenty:  /c npm run publish >> publish.log 2>&1
Rozpocznij w:  C:\Users\pgarncarz\Desktop\Strona internetowa
```

Gdy nic się nie zmieniło, skrypt kończy pracę bez łączenia z FTP, więc puste przebiegi
nic nie kosztują.

### Czego ten wariant nie daje

- **Wpis czeka na Twój komputer.** Wyłączony albo zabrany na urlop komputer to blog,
  który stoi. Pracownik zapisze wpis w panelu i nic się nie stanie.
- **Nie ma kopii ani historii kodu.** To nadal otwarty punkt 1 z `do_zrobienia.md`.
  Zrób choćby lokalne `git init` i kopiuj katalog projektu poza Pulpit.
- **Jeden komputer naraz.** `publish-state.json` opisuje, co ta maszyna wysłała.
  Publikowanie z dwóch komputerów rozjedzie ten stan i skończy się nadmiarowymi wysyłkami.

### Zanim wyślesz pierwszy raz

W `public/` leżą `hero.png` (13 MB) i `logo.jpg`, **oba nieużywane** (punkt 5
w `do_zrobienia.md`). Idą do `dist`, więc pierwsza wysyłka przepchnie je przez FTP
bez powodu. Skasowanie ich przed startem zdejmuje jakieś 13 MB z każdej pełnej wysyłki.

## Koszty

- Supabase: darmowy plan wystarcza (limit to 500 MB bazy i 1 GB na pliki).
- GitHub Actions: repozytorium prywatne ma 2000 minut miesięcznie w darmowym planie.
  Jeden deploy to około 2 minuty, keepalive kilka sekund.
- home.pl: bez zmian, płacisz to co dziś.
