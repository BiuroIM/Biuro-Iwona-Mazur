import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { card, field, hint, label, noticeError, pill } from './styles.js';
import { describeError } from './errors.js';

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
      setError(describeError(authError, 'Nie udało się zalogować.'));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${card} mx-auto w-[min(28rem,92vw)]`}>
      <p className={`${hint} text-center`}>
        Zaloguj się danymi, które dostałaś lub dostałeś od administratora strony.
      </p>

      <div className="mt-[clamp(1.5rem,2.2vw,2.5rem)]">
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

      {error && <p className={`${noticeError} mt-[clamp(1rem,1.5vw,1.8rem)]`}>{error}</p>}

      <button className={`${pill} mt-[clamp(1.5rem,2.2vw,2.5rem)] w-full`} type="submit" disabled={busy}>
        {busy ? 'Loguję' : 'Zaloguj się'}
      </button>
    </form>
  );
}
