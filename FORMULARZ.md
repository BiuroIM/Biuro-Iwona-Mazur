# Formularz kontaktowy i powiadomienia na Teams

> Co się dzieje po kliknięciu „Wyślij" i jak podłączyć kanał na Microsoft Teams.
> Baza i uprawnienia: `supabase/schema.sql`. Panel wpisów (ten sam mechanizm `pg_net`): `PANEL.md`.

## Obieg zgłoszenia

Strona jest statyczna, nie ma własnego serwera, który mógłby odebrać `POST`.
Zgłoszenie leci więc wprost do bazy, a powiadomienie wychodzi z bazy.

```
odwiedzający → formularz (przeglądarka) → Supabase: insert do public.leads
                                                │
                                                │ trigger SQL (pg_net)
                                                ▼
                                    webhook „Workflows" w Teams
                                                │
                                                ▼
                                     karta na kanale / w czacie
```

Dwie ważne konsekwencje tego kształtu:

- **Zgłoszenie nie ginie, gdy Teams nie odpowie.** Rekord jest w bazie niezależnie od
  powiadomienia. `pg_net` strzela asynchronicznie i nie blokuje zapisu.
- **Podziękowanie w formularzu pokazuje się tylko po udanym zapisie.** Jeśli baza zwróci
  błąd, użytkownik widzi komunikat z numerem telefonu, a nie fałszywe „Dziękujemy!".

## Formularz w dwóch miejscach, jedna obsługa

| Miejsce | Komponent | `source` w bazie |
| --- | --- | --- |
| Panel wysuwany z prawej (cała strona) | `ContactForm.astro` → `FormFields.astro` | `panel` |
| Sekcja na `/kontakt` | `kontakt.astro` → `FormFields.astro` | `kontakt` |

Oba warianty (trzykrokowy i jednoekranowy) obsługuje `bindFormSteps()` w
`src/scripts/animations.js`. Wysyłkę robi `sendLead()` w `src/scripts/animations/forms.js`:
czyta `FormData`, puste pola opcjonalne zamienia na `null` i woła
`supabase.from('leads').insert(...)`.

Klient Supabase jest **importowany dynamicznie w momencie wysyłki**, nie na starcie strony.
`@supabase/supabase-js` to ~200 kB, a Core Web Vitals są priorytetem projektu, więc na
pierwsze malowanie ta paczka nie może wchodzić. W `dist/_astro/` widać ją jako osobny plik
`supabaseClient.*.js` pobierany po kliknięciu „Wyślij".

## Podłączenie Teams (do zrobienia raz, w przeglądarce)

Stare „Incoming Webhook" z Office 365 Connectors **już nie działa** — Microsoft je wyłączył
(termin migracji: 31 marca 2026). Zastąpiły je przepływy **Power Automate**, dostępne w Teams
jako aplikacja **Workflows**.

Nic się nie instaluje i nie dopłaca. Przepływ używa standardowego łącznika Microsoft Teams,
a te są wliczone w firmowe plany Microsoft 365. Płatne jest to, co ma **ikonę diamentu** albo
dopisek **Premium** — w szczególności wyzwalacz „Gdy zostanie odebrane żądanie HTTP", który
nazwą pasuje najlepiej i jest złym wyborem. Właściwy wyzwalacz to ten od Teams.

Poniższa droga jest przez przeglądarkę, nie przez kreator w Teams. Kreator robi to samo,
ale po zapisaniu potrafi nie pokazać adresu i zostawić zakładkę Power Automate z komunikatem
„nie masz tu żadnych przepływów" oraz przyciskiem „Przełącz się do swojego środowiska
deweloperskiego". Tego przycisku nie klikać: zakłada kolejne, puste środowisko.

0. **Wpuść aplikację Workflows do zespołu, na którego kanał mają iść powiadomienia.**
   W Teams: najedź na **zespół** (nie kanał) → `…` → **Zarządzaj zespołem** → **Aplikacje** →
   **Więcej aplikacji** → dodaj **Workflows**. Bot przepływu jest osobną tożsamością i bez
   tego kroku Teams odrzuca publikację, mimo że przepływ zapisuje się i przyjmuje żądania.
   W świeżo utworzonym zespole tej aplikacji nie ma.
1. <https://make.powerautomate.com>, zalogowany kontem firmowym.
2. **Przełącznik środowiska w prawym górnym rogu** → wybierz **domyślne**
   (nazwa firmy z dopiskiem „(default)" / „(domyślne)"). Pominięcie tego kroku to najczęstszy
   powód, dla którego lista przepływów wygląda na pustą.
3. Menu po lewej → **Szablony** → wpisz `webhook`.
4. Wybierz **„Wysyłaj alerty elementu webhook na kanał"**
   (ang. „Send webhook alerts to a channel"). Na prywatną wiadomość: **„…na czat"**.

   **Nie** bierz wariantów „od określonych osób" ani „od osób z organizacji". One wymagają,
   żeby żądanie wysłał zalogowany użytkownik Teams, a u nas wysyła je baza danych — adres
   wygeneruje się normalnie, tylko każde powiadomienie zostanie odrzucone. Warianty
   z dopiskiem **(TEST)** to wewnętrzne szablony Microsoftu, też nie.
5. Ekran połączeń: konto przy „Microsoft Teams" → **Kontynuuj** → wskaż zespół i kanał →
   **Utwórz**.
6. **Edytuj** przepływ i kliknij pierwszy blok, **„Po odebraniu żądania skierowanego do
   elementu webhook aplikacji Teams"**. Kopiujesz pole **Adres URL HTTP**. W tym samym bloku
   sprawdź **„Kto może wyzwolić przepływ"** — ma być **Każdy**.

   Pozostałe bloki (dwie zmienne i przełącznik rozpoznający format karty) zostawiasz
   nietknięte. To standardowa zawartość szablonu.
7. Wklej adres do bazy (SQL Editor w Supabase, projekt strony):

```sql
insert into private.app_settings (key, value)
values ('teams_webhook_url', 'TU_WKLEJ_ADRES')
on conflict (key) do update set value = excluded.value;
```

Adres jest sekretem: kto go ma, może pisać w to miejsce. Unieważnia się go, kasując przepływ.

Dopóki wiersza w bazie nie ma, trigger po prostu nic nie robi — formularz działa i zapisuje
zgłoszenia, tylko powiadomienie nie wychodzi. Usunięcie wiersza wyłącza powiadomienia.

Zmiana miejsca, w które lecą powiadomienia (np. z kanału testowego na kanał zespołu), to
nowy przepływ i podmiana tej jednej wartości. W kodzie strony nie zmienia się nic.

### „not a member or an owner of the team or channel"

Najkosztowniejsza pułapka przy pierwszym uruchomieniu, bo z zewnątrz wygląda jak awaria
formularza. Baza dostaje `202`, zgłoszenia zapisują się poprawnie, a mimo to w Teams pusto.
`202` znaczy tylko tyle, że Power Automate przyjął żądanie do kolejki — publikacja dzieje się
później i to ona się wywraca. Widać to w **Historia uruchomień** przy przepływie.

Ten konkretny błąd oznacza, że bot przepływu nie jest członkiem zespołu, czyli brakuje
kroku 0. Lekarstwem jest dodanie aplikacji **Workflows** do zespołu, a nie grzebanie
w przepływie.

Czego **nie** robić przy tym błędzie, bo tylko pogarsza sytuację:

- zmieniać **Opublikuj jako** z `Bot przepływu` na `Użytkownik` — czyści pole
  **Karta adaptacyjna** i trzeba je odtwarzać wyrażeniem `item()?['content']`,
- edytować warunek „Attachments is null" ani pętli `For each` — szablon jest poprawny.

Jeśli przepływ zdążył już zebrać ręczne poprawki, taniej jest skasować go i utworzyć
z szablonu od nowa, niż cofać zmiany.

### Wariant na czas testów: prywatna wiadomość zamiast kanału

Żeby karty testowe nie leciały na kanał, który widzi całe biuro, najprościej założyć
**prywatny zespół tylko dla siebie**: Teams → Zespoły → Utwórz zespół → Od podstaw →
Prywatny, i pominąć dodawanie osób. Potem wskazać ten zespół w kroku 5 powyżej.

Szablon „…na czat" wygląda na wygodniejszy, ale wybiera się przy nim czat z istniejącej listy,
a **czat z samym sobą się na niej zwykle nie pojawia** (kreator listuje czaty grupowe).
Świeżo utworzony zespół też potrafi nie od razu wejść na listę: to cache Power Automate,
mija po kilkunastu minutach albo po ponownym uruchomieniu Teams.

Zanim webhook trafi do bazy, warto strzelić w niego bezpośrednio (PowerShell, bez ruszania
strony i bazy):

```powershell
$url = 'TU_WKLEJ_ADRES'
$card = @'
{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","contentUrl":null,"content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","size":"Medium","weight":"Bolder","text":"Nowe zgłoszenie ze strony"},{"type":"FactSet","facts":[{"title":"Imię i nazwisko","value":"Jan Kowalski"},{"title":"Telefon","value":"600 100 200"}]},{"type":"TextBlock","wrap":true,"text":"Test kanału powiadomień."}]}}]}
'@
Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($card))
```

Kod `202 Accepted` i karta w Teams = webhook działa. Dopiero wtedy ma sens wpisywanie go
do `private.app_settings`. Kolejność jest taka, bo błąd po stronie Teamsa i błąd triggera
wyglądają z bazy identycznie: `pg_net` strzela asynchronicznie i nie zgłasza nic w miejscu
wysyłki formularza.

Test bez wypełniania formularza:

```sql
insert into public.leads (name, phone, email, business_form, scope, message, source)
values ('Test Teams', '600 100 200', 'test@example.com', 'Spółka z o.o.', 'księgowość', 'zgłoszenie testowe', 'kontakt');
```

Odpowiedź Teamsa (kod HTTP, treść błędu) wyląduje w `net._http_response`:

```sql
select status_code, content, created from net._http_response order by created desc limit 5;
```

## Kształt powiadomienia

Trigger `private.notify_new_lead()` buduje **Adaptive Card** w kopercie, której wymaga
Workflows: `{"type": "message", "attachments": [{"contentType": "application/vnd.microsoft.card.adaptive", "content": {…}}]}`.
Sama karta to nagłówek, data w strefie `Europe/Warsaw`, `FactSet` z danymi kontaktowymi
i na końcu treść wiadomości. Puste pola opcjonalne pokazują się jako `—`.

Zmiana treści karty = zmiana tej funkcji w `supabase/schema.sql` i ponowne uruchomienie jej
w bazie. Układ pól można podglądać na <https://adaptivecards.io/designer/>.

## Kto ma dostęp do zgłoszeń

| Rola | `public.leads` |
| --- | --- |
| `anon` (każdy odwiedzający) | tylko `insert`, i tylko na wskazane kolumny |
| `authenticated` (pracownik zalogowany w panelu) | `insert` i `select` |

Rola `authenticated` musi mieć `insert`, choć na pierwszy rzut oka wystarczyłby sam `anon`.
Powód: pracownik, który loguje się do `/panel`, ma w tej samej przeglądarce aktywną sesję
Supabase, więc `supabase-js` wysyła jego token i zapis idzie jako `authenticated`. Przy
uprawnieniu tylko dla `anon` gość ze strony zapisze się bez problemu, a osoba z biura
dostanie `403` i komunikat o nieudanej wysyłce. Wygląda to wtedy jak awaria formularza,
a jest to różnica ról.

`anon` **nie może czytać** zgłoszeń. To istotne, bo klucz `PUBLIC_SUPABASE_ANON_KEY` jest
w kodzie strony, czyli publiczny — gdyby doszedł do tego `select`, każdy wyciągnąłby całą
listę klientów. Sprawdzone: `select` na roli `anon` kończy się `permission denied`.

Panel nie ma jeszcze widoku listy zgłoszeń. Na razie czyta się je z tabeli w Supabase
(Table Editor → `leads`) albo z powiadomień na Teams.

## Ochrona przed botami

Klucz `anon` jest publiczny, więc każdy może wysłać `insert` bez otwierania strony.
Ograniczenia, które są:

- **Honeypot** — ukryte pole `website` w formularzu. Jeśli bot je wypełni, formularz
  udaje sukces i **nic nie zapisuje** (`data-form-trap` w `FormFields.astro`).
- **Ograniczenia w bazie** — `check` na długości wszystkich pól (imię 2–120, telefon 6–40,
  wiadomość do 2000 znaków), `@` wymagane w e-mailu, `source` tylko `panel` albo `kontakt`.
  To ucina wrzucanie do bazy dowolnych treści.

Czego **nie ma**: limitu liczby zgłoszeń na godzinę i captchy. Przy statycznej stronie
jedno i drugie wymaga czegoś, co odbierze żądanie przed bazą (Edge Function albo Turnstile).
Do przemyślenia, jeśli zaczną przychodzić śmieci. Sam koszt spamu jest niski: rekord w bazie
i karta na Teams, bez wysyłki e-maili.

## Walidacja

Formularz ma `novalidate`, więc dymki przeglądarki się nie pokazują. Reguły są w `LEAD_RULES`
w `src/scripts/animations/forms.js`, a komunikat pojawia się pod polem (`data-field-error`)
na czerwono, razem z czerwoną linią pola (`aria-invalid`).

| Pole | Reguła |
| --- | --- |
| Imię i nazwisko | wymagane, 2 do 120 znaków, tylko litery, spacje, kropka, apostrof i łącznik |
| Telefon | wymagany, cyfry, spacje, nawiasy i `+`; 9 cyfr, `48` + 9 cyfr albo numer zagraniczny z `+` (8 do 15 cyfr) |
| E-mail | wymagany, kształt `nazwa@domena.pl`, do 160 znaków, zapisywany małymi literami |
| Forma działalności | wymagana |
| Czego potrzebujesz | opcjonalne, do 300 znaków |
| Wiadomość | opcjonalna, do 2000 znaków |

Pole sprawdza się po wyjściu z niego, jeśli coś wpisano, a po pierwszym błędzie na bieżąco
przy pisaniu. Przycisk „Dalej” i „Wyślij” sprawdza cały krok i ustawia kursor w pierwszym
błędnym polu. Te same limity długości pilnuje baza (`leads_*` w `supabase/schema.sql`).

Panel wpisów (`PanelForm.jsx`) sprawdza: tytuł 10 do 160 znaków, wprowadzenie do 300,
opis zdjęcia do 200, treść do 60 000, kategorię z listy, brak nagłówka `# `, linki bez adresu
i linki bez `https://`. Odpowiednie constrainty `posts_*` są w `supabase/schema.sql`
z opcją `not valid`, więc nie ruszają istniejących wpisów. Trzeba je raz uruchomić
w Supabase (SQL Editor), bo plik nie wykonuje się sam.
