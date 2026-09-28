import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { formatDateMonthFirst } from '../../data/blog.js';
import {
  coverFrame,
  coverImage,
  hint,
  noticeError,
  pill,
  sectionTitle,
  smallButton,
  smallButtonDanger,
  tileMeta,
  tileTitle,
} from './styles.js';
import { describeError } from './errors.js';

export default function PanelList({ onEdit, onCreate }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (queryError) {
      setError(describeError(queryError, 'Nie udało się wczytać listy wpisów.'));
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
      setError(describeError(updateError, 'Nie udało się zmienić widoczności wpisu.'));
      return;
    }

    load();
  };

  const remove = async (post) => {
    if (!window.confirm(`Usunąć wpis "${post.title}"? Tej operacji nie da się cofnąć.`)) return;

    const { error: deleteError } = await supabase.from('posts').delete().eq('id', post.id);

    if (deleteError) {
      setError(describeError(deleteError, 'Nie udało się usunąć wpisu.'));
      return;
    }

    load();
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-[2vw] max-sm:flex-col max-sm:items-start max-sm:gap-[4vw]">
        <h2 className={sectionTitle}>Wpisy na blogu</h2>

        <button className={pill} type="button" onClick={onCreate}>
          Napisz nowy wpis
        </button>
      </div>

      {error && <p className={`${noticeError} mt-[clamp(2rem,3vw,4rem)]`}>{error}</p>}

      {posts === null && <p className={`${hint} mt-[clamp(2rem,3vw,4rem)]`}>Ładuję listę wpisów</p>}

      {posts?.length === 0 && (
        <p className={`${hint} mt-[clamp(2rem,3vw,4rem)] max-w-[42vw] max-lg:max-w-none`}>
          Nie ma jeszcze żadnego wpisu dodanego przez panel. Wpisy z plików na serwerze nie pokazują się
          na tej liście i zostają nietknięte.
        </p>
      )}

      {posts?.length > 0 && (
        <div className="mt-[3vw] grid grid-cols-2 gap-x-[2vw] gap-y-[5vw] max-lg:mt-[8vw] max-lg:gap-y-[10vw] max-sm:grid-cols-1">
          {posts.map((post) => (
            <article key={post.id}>
              <div className={coverFrame}>
                <img className={coverImage} src={post.cover_url} alt={post.cover_alt} loading="lazy" />
              </div>

              <div className={tileMeta}>
                <span className="h-[0.5em] w-[0.5em] shrink-0 rounded-full bg-graphite/90" aria-hidden="true" />
                <time dateTime={post.published_at.slice(0, 10)}>
                  {formatDateMonthFirst(new Date(post.published_at))}
                </time>
                <span aria-hidden="true">·</span>
                <span>{post.category}</span>
                {!post.published && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-alert">ukryty</span>
                  </>
                )}
              </div>

              <h3 className={tileTitle}>{post.title}</h3>

              <p className={`${hint} mt-[clamp(0.4rem,0.6vw,0.8rem)]`}>/blog/{post.slug}</p>

              <div className="mt-[clamp(1rem,1.4vw,2rem)] flex flex-wrap items-center gap-[clamp(0.5rem,0.7vw,0.9rem)]">
                <button className={smallButton} type="button" onClick={() => onEdit(post)}>
                  Edytuj
                </button>
                <button className={smallButton} type="button" onClick={() => togglePublished(post)}>
                  {post.published ? 'Ukryj' : 'Pokaż'}
                </button>
                <button className={smallButtonDanger} type="button" onClick={() => remove(post)}>
                  Usuń
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
