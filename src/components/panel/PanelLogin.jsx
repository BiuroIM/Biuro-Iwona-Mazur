import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { buttonPrimary, errorBox, field, heading, hint, label } from './styles.js';

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
    <form onSubmit={submit} className="mx-auto w-[min(28rem,92vw)] py-[clamp(4rem,8vw,10rem)]">
      <h1 className={heading}>Panel wpisów</h1>
      <p className={`${hint} mt-[clamp(0.5rem,0.8vw,1rem)]`}>
        Zaloguj się danymi, które dostałaś lub dostałeś od administratora strony.
      </p>

      <div className="mt-[clamp(1.5rem,2.5vw,3rem)]">
        <label className={label} htmlFor="panel-email">
          E-mail
        </label>
        <input
          id="panel-email"
          className={field}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="mt-[clamp(1rem,1.5vw,1.8rem)]">
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

      {error && <p className={`${errorBox} mt-[clamp(1rem,1.5vw,1.8rem)]`}>{error}</p>}

      <button className={`${buttonPrimary} mt-[clamp(1.5rem,2.2vw,2.5rem)] w-full`} type="submit" disabled={busy}>
        {busy ? 'Loguję' : 'Zaloguj się'}
      </button>
    </form>
  );
}
