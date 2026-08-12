import { useEffect, useState } from 'react';
import { isConfigured, supabase } from '../../lib/supabaseClient.js';
import PanelLogin from './PanelLogin.jsx';
import PanelList from './PanelList.jsx';
import PanelForm from './PanelForm.jsx';
import { buttonGhost, errorBox, hint, noticeBox, shell } from './styles.js';

export default function PanelApp() {
  const [session, setSession] = useState(undefined);
  const [view, setView] = useState({ name: 'list' });
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!isConfigured) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));

    return () => data.subscription.unsubscribe();
  }, []);

  if (!isConfigured) {
    return (
      <div className={shell}>
        <p className={errorBox}>
          Panel nie jest podłączony do Supabase. Brakuje zmiennych PUBLIC_SUPABASE_URL i PUBLIC_SUPABASE_ANON_KEY.
          Opis konfiguracji jest w pliku PANEL.md.
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
      <header className="flex items-center justify-between gap-[2vw] border-b border-graphite/20 pb-[clamp(1rem,1.5vw,1.8rem)] max-sm:flex-col max-sm:items-start max-sm:gap-[1rem]">
        <div>
          <p className="font-display text-[clamp(0.7rem,0.85vw,0.95rem)] font-medium uppercase tracking-[0.2em] text-graphite/60">
            Biuro Rachunkowe Iwona Mazur
          </p>
          <p className={`${hint} mt-[clamp(0.2rem,0.3vw,0.4rem)]`}>Zalogowana jako {session.user.email}</p>
        </div>

        <button className={buttonGhost} type="button" onClick={() => supabase.auth.signOut()}>
          Wyloguj
        </button>
      </header>

      <main className="mt-[clamp(1.5rem,2.5vw,3rem)]">
        {savedAt && view.name === 'list' && (
          <p className={`${noticeBox} mb-[clamp(1rem,1.5vw,1.8rem)]`}>
            Zapisane. Strona przebudowuje się teraz sama, wpis pojawi się na blogu w ciągu kilku minut.
          </p>
        )}

        {view.name === 'list' ? (
          <PanelList
            onCreate={() => {
              setSavedAt(null);
              setView({ name: 'form', post: null });
            }}
            onEdit={(post) => {
              setSavedAt(null);
              setView({ name: 'form', post });
            }}
          />
        ) : (
          <PanelForm
            post={view.post}
            session={session}
            onSaved={() => {
              setSavedAt(new Date());
              setView({ name: 'list' });
            }}
            onCancel={() => setView({ name: 'list' })}
          />
        )}
      </main>
    </div>
  );
}
