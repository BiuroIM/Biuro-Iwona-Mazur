import { useEffect, useState } from 'react';
import { isConfigured, supabase } from '../../lib/supabaseClient.js';
import PanelLogin from './PanelLogin.jsx';
import PanelList from './PanelList.jsx';
import PanelForm from './PanelForm.jsx';
import { hint, notice, noticeError, shell, textLink } from './styles.js';

export default function PanelApp() {
  const [session, setSession] = useState(undefined);
  const [view, setView] = useState({ name: 'list' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));

    return () => data.subscription.unsubscribe();
  }, []);

  if (!isConfigured) {
    return (
      <div className={shell}>
        <p className={noticeError}>
          Panel nie jest podłączony do Supabase. Brakuje zmiennych PUBLIC_SUPABASE_URL i
          PUBLIC_SUPABASE_ANON_KEY. Opis konfiguracji jest w pliku PANEL.md.
        </p>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className={shell}>
        <p className={hint}>Sprawdzam, czy jesteś zalogowana lub zalogowany</p>
      </div>
    );
  }

  if (!session) {
    return <PanelLogin />;
  }

  return (
    <div className={shell}>
      <div className="flex items-center justify-end gap-[clamp(1rem,1.6vw,2.2rem)] border-b border-ink/15 pb-[clamp(1rem,1.4vw,1.8rem)]">
        <p className={hint}>Zalogowana jako {session.user.email}</p>

        <button className={textLink} type="button" onClick={() => supabase.auth.signOut()}>
          Wyloguj
        </button>
      </div>

      <div className="mt-[clamp(2.5rem,4vw,5.5rem)]">
        {saved && view.name === 'list' && (
          <p className={`${notice} mb-[clamp(2rem,3vw,4rem)]`}>
            Zapisane. Strona przebudowuje się teraz sama, wpis pojawi się na blogu w ciągu kilku minut.
          </p>
        )}

        {view.name === 'list' ? (
          <PanelList
            onCreate={() => {
              setSaved(false);
              setView({ name: 'form', post: null });
            }}
            onEdit={(post) => {
              setSaved(false);
              setView({ name: 'form', post });
            }}
          />
        ) : (
          <PanelForm
            post={view.post}
            session={session}
            onSaved={() => {
              setSaved(true);
              setView({ name: 'list' });
            }}
            onCancel={() => setView({ name: 'list' })}
          />
        )}
      </div>
    </div>
  );
}
