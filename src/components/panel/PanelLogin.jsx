import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { field, hint, label, noticeError, pill } from './styles.js';

const AUTH_MESSAGES = {
  'Invalid login credentials': 'Nieprawidłowy e-mail lub hasło.',
  'Email not confirmed': 'Konto nie zostało jeszcze potwierdzone. Sprawdź skrzynkę.',
  'Email logins are disabled': 'Logowanie e-mailem jest wyłączone w Supabase.',
};

export default function PanelLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(AUTH_MESSAGES[authError.message] ?? authError.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-[32vw] px-[2vw] pb-[8vw] max-lg:w-full max-lg:px-[4vw]">
      <p className={hint}>Zaloguj się danymi, które dostałaś lub dostałeś od administratora strony.</p>

      <div className="mt-[clamp(2rem,3vw,4rem)]">
        <label className={label} htmlFor="panel-email">
          E-mail
        </label>
        <input
          id="panel-email"
          className={field}
          type="email"
          autoComplete="username"
          placeholder="imie@biuro-mazur.pl"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="mt-[clamp(1.5rem,2.2vw,3rem)]">
        <label className={label} htmlFor="panel-password">
          Hasło
        </label>
        <input
          id="panel-password"
          className={field}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && <p className={`${noticeError} mt-[clamp(1.5rem,2.2vw,3rem)]`}>{error}</p>}

      <button className={`${pill} mt-[clamp(2rem,3vw,4rem)]`} type="submit" disabled={busy}>
        {busy ? 'Loguję' : 'Zaloguj się'}
      </button>
    </form>
  );
}
