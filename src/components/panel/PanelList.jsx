import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { formatDate } from '../../data/blog.js';
import {
  buttonDanger,
  buttonGhost,
  buttonPrimary,
  card,
  errorBox,
  hint,
  subheading,
} from './styles.js';

export default function PanelList({ onEdit, onCreate }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      return;
    }

    setError('');
    setPosts(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublished = async (post) => {
    const { error: updateError } = await supabase
      .from('posts')
      .update({ published: !post.published })
      .eq('id', post.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    load();
  };

  const remove = async (post) => {
    if (!window.confirm(`Usunąć wpis "${post.title}"? Tej operacji nie da się cofnąć.`)) return;

    const { error: deleteError } = await supabase.from('posts').delete().eq('id', post.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    load();
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-[2vw] max-sm:flex-col max-sm:items-start max-sm:gap-[1rem]">
        <h2 className={subheading}>Wpisy na blogu</h2>
        <button className={buttonPrimary} type="button" onClick={onCreate}>
          Napisz nowy wpis
        </button>
      </div>

      {error && <p className={`${errorBox} mt-[clamp(1rem,1.5vw,1.8rem)]`}>{error}</p>}

      {posts === null && <p className={`${hint} mt-[clamp(1rem,1.5vw,1.8rem)]`}>Ładuję listę wpisów</p>}

      {posts?.length === 0 && (
        <p className={`${hint} mt-[clamp(1rem,1.5vw,1.8rem)]`}>
          Nie ma jeszcze żadnego wpisu dodanego przez panel. Wpisy z plików na serwerze nie pokazują się
          na tej liście i zostają nietknięte.
        </p>
      )}

      <ul className="mt-[clamp(1.2rem,2vw,2.5rem)] flex flex-col gap-[clamp(0.6rem,1vw,1.2rem)]">
        {posts?.map((post) => (
          <li key={post.id} className={`${card} flex items-center justify-between gap-[1.5vw] max-md:flex-col max-md:items-start max-md:gap-[1rem]`}>
            <div>
              <p className="font-display text-[clamp(0.95rem,1.25vw,1.4rem)] font-medium uppercase leading-[1.2] text-graphite">
                {post.title}
              </p>
              <p className={`${hint} mt-[clamp(0.25rem,0.4vw,0.5rem)]`}>
                {formatDate(new Date(post.published_at))} · {post.category} · /blog/{post.slug}
                {!post.published && ' · ukryty'}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-[clamp(0.4rem,0.6vw,0.8rem)]">
              <button className={buttonGhost} type="button" onClick={() => onEdit(post)}>
                Edytuj
              </button>
              <button className={buttonGhost} type="button" onClick={() => togglePublished(post)}>
                {post.published ? 'Ukryj' : 'Pokaż'}
              </button>
              <button className={buttonDanger} type="button" onClick={() => remove(post)}>
                Usuń
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
