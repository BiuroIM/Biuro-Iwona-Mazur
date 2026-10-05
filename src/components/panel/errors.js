export class PanelError extends Error {}

const NO_CONNECTION = 'Brak połączenia z serwerem. Sprawdź internet i spróbuj jeszcze raz.';
const NO_PERMISSION = 'Twoje konto nie ma uprawnień do tej operacji. Zgłoś to administratorowi strony.';
const SESSION_GONE = 'Sesja wygasła. Zaloguj się jeszcze raz.';
const TITLE_TAKEN = 'Wpis o takim tytule już istnieje. Zmień tytuł.';
const TOO_MANY_TRIES = 'Za dużo prób pod rząd. Odczekaj chwilę i spróbuj jeszcze raz.';

const MESSAGE_MAP = {
  'Invalid login credentials': 'Nieprawidłowy e-mail lub hasło.',
  'Email not confirmed': 'Konto nie zostało jeszcze potwierdzone. Sprawdź skrzynkę.',
  'Email logins are disabled': 'Logowanie e-mailem jest wyłączone w Supabase.',
  'Failed to fetch': NO_CONNECTION,
  'Load failed': NO_CONNECTION,
};

const CODE_MAP = {
  23505: TITLE_TAKEN,
  23502: 'Brakuje wymaganego pola. Uzupełnij wpis i zapisz jeszcze raz.',
  22001: 'Któreś pole jest za długie. Skróć je i zapisz jeszcze raz.',
  23514: 'Któreś pole ma niedozwoloną długość albo wartość. Sprawdź tytuł, wprowadzenie i opis zdjęcia.',
  42501: NO_PERMISSION,
  PGRST301: SESSION_GONE,
  PGRST116: 'Nie znaleziono wpisu. Odśwież listę wpisów.',
};

const PATTERN_MAP = [
  [/row-level security/i, NO_PERMISSION],
  [/permission denied/i, NO_PERMISSION],
  [/resource already exists/i, 'Plik o takiej nazwie już jest na serwerze. Wybierz zdjęcie jeszcze raz.'],
  [/duplicate key/i, TITLE_TAKEN],
  [/jwt|refresh token|not authenticated/i, SESSION_GONE],
  [/payload too large|maximum allowed size/i, 'Plik jest za duży dla serwera. Wybierz mniejsze zdjęcie.'],
  [/rate limit|too many requests/i, TOO_MANY_TRIES],
  [/fetch|network/i, NO_CONNECTION],
];

export function describeError(error, fallback = 'Coś poszło nie tak. Spróbuj jeszcze raz.') {
  if (error instanceof PanelError) return error.message;

  const message = typeof error === 'string' ? error : (error?.message ?? '');
  const code = error?.code ?? '';

  if (MESSAGE_MAP[message]) return MESSAGE_MAP[message];
  if (CODE_MAP[code]) return CODE_MAP[code];

  const matched = PATTERN_MAP.find(([pattern]) => pattern.test(message));
  if (matched) return matched[1];

  return message ? `${fallback} Kod dla administratora: ${message}` : fallback;
}
