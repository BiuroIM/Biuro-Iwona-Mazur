import { useRef, useState } from 'react';
import { marked } from 'marked';
import { supabase } from '../../lib/supabaseClient.js';
import { toSlug } from '../../lib/slug.js';
import {
  buttonGhost,
  buttonPrimary,
  errorBox,
  field,
  hint,
  label,
  noticeBox,
  subheading,
  textarea,
} from './styles.js';

const CATEGORIES = ['Aktualności', 'Podatki', 'Księgowość', 'Kadry i płace', 'Poradnik'];

const MAX_COVER_BYTES = 8 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const EMPTY_DRAFT = {
  title: '',
  lead: '',
  body: '',
  category: 'Aktualności',
  cover_url: '',
  cover_alt: '',
};

export default function PanelForm({ post, session, onSaved, onCancel }) {
  const [draft, setDraft] = useState(post ? { ...post } : EMPTY_DRAFT);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(post?.cover_url ?? '');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);

  const isNew = !post;
  const slug = isNew ? toSlug(draft.title) : post.slug;

  const update = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  const pickCover = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Zdjęcie musi być w formacie JPG, PNG, WEBP albo AVIF.');
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      setError('Zdjęcie jest za duże. Maksimum to 8 MB.');
      return;
    }

    setError('');
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const surroundSelection = (before, after) => {
    const input = bodyRef.current;
    if (!input) return;

    const { selectionStart, selectionEnd, value } = input;
    const selected = value.slice(selectionStart, selectionEnd);
    const next = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;

    setDraft((current) => ({ ...current, body: next }));

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(selectionStart + before.length, selectionEnd + before.length);
    });
  };

  const startLine = (prefix) => {
    const input = bodyRef.current;
    if (!input) return;

    const { selectionStart, value } = input;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const next = `${value.slice(0, lineStart)}${prefix}${value.slice(lineStart)}`;

    setDraft((current) => ({ ...current, body: next }));

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(selectionStart + prefix.length, selectionStart + prefix.length);
    });
  };

  const uploadCover = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const name = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(name, file, { contentType: file.type });

    if (uploadError) {
      throw new Error(`Nie udało się wgrać zdjęcia: ${uploadError.message}`);
    }

    return supabase.storage.from('covers').getPublicUrl(name).data.publicUrl;
  };

  const insertWithFreeSlug = async (payload) => {
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      const candidate = attempt === 1 ? payload.slug : `${payload.slug}-${attempt}`;
      const { error: insertError } = await supabase.from('posts').insert({ ...payload, slug: candidate });

      if (!insertError) return;
      if (insertError.code !== '23505') throw new Error(insertError.message);
    }

    throw new Error('Wpis o takim tytule już istnieje. Zmień tytuł.');
  };

  const validate = () => {
    if (!draft.title.trim()) return 'Wpis musi mieć tytuł.';
    if (!slug) return 'Z tytułu nie da się zrobić adresu. Użyj w nim liter albo cyfr.';
    if (!draft.lead.trim()) return 'Wypełnij wprowadzenie. Pokazuje się na liście wpisów i w Google.';
    if (!draft.body.trim()) return 'Wpis nie ma treści.';
    if (!coverFile && !draft.cover_url) return 'Dodaj zdjęcie okładki.';
    if (!draft.cover_alt.trim()) return 'Opisz zdjęcie. Ten opis czytają czytniki ekranu i Google.';
    return '';
  };

  const submit = async (event) => {
    event.preventDefault();

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setBusy(true);

    try {
      const coverUrl = coverFile ? await uploadCover(coverFile) : draft.cover_url;

      const payload = {
        slug,
        title: draft.title.trim(),
        lead: draft.lead.trim(),
        body: draft.body.trim(),
        category: draft.category,
        cover_url: coverUrl,
        cover_alt: draft.cover_alt.trim(),
        author_email: session.user.email,
      };

      if (isNew) {
        await insertWithFreeSlug(payload);
      } else {
        const { error: updateError } = await supabase.from('posts').update(payload).eq('id', post.id);
        if (updateError) throw new Error(updateError.message);
      }

      onSaved();
    } catch (saveError) {
      setError(saveError.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="flex items-end justify-between gap-[2vw] max-sm:flex-col max-sm:items-start max-sm:gap-[1rem]">
        <h2 className={subheading}>{isNew ? 'Nowy wpis' : 'Edycja wpisu'}</h2>
        <button className={buttonGhost} type="button" onClick={onCancel} disabled={busy}>
          Wróć do listy
        </button>
      </div>

      <p className={`${noticeBox} mt-[clamp(1rem,1.5vw,1.8rem)]`}>
        Po zapisaniu strona przebudowuje się sama. Wpis pojawia się pod adresem <strong>/blog/{slug || '…'}</strong>
        {' '}zwykle w ciągu kilku minut.
      </p>

      <div className="mt-[clamp(1.5rem,2.2vw,2.5rem)]">
        <label className={label} htmlFor="post-title">
          Tytuł wpisu
        </label>
        <input id="post-title" className={field} type="text" value={draft.title} onChange={update('title')} />
        {!isNew && (
          <p className={`${hint} mt-[clamp(0.25rem,0.4vw,0.5rem)]`}>
            Adres wpisu zostaje bez zmian: /blog/{post.slug}. Zmiana adresu zepsułaby linki, które ktoś już zapisał.
          </p>
        )}
      </div>

      <div className="mt-[clamp(1rem,1.6vw,1.8rem)]">
        <label className={label} htmlFor="post-lead">
          Wprowadzenie
        </label>
        <textarea
          id="post-lead"
          className={`${field} min-h-[clamp(5rem,8vw,9rem)] resize-y leading-[1.5]`}
          value={draft.lead}
          onChange={update('lead')}
        />
        <p className={`${hint} mt-[clamp(0.25rem,0.4vw,0.5rem)]`}>
          Jedno albo dwa zdania. Widać je na liście wpisów i w wynikach wyszukiwania.
        </p>
      </div>

      <div className="mt-[clamp(1rem,1.6vw,1.8rem)] grid grid-cols-2 gap-[clamp(1rem,1.6vw,2rem)] max-md:grid-cols-1">
        <div>
          <label className={label} htmlFor="post-category">
            Kategoria
          </label>
          <select id="post-category" className={field} value={draft.category} onChange={update('category')}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="post-cover">
            Zdjęcie okładki
          </label>
          <input
            id="post-cover"
            className={field}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={pickCover}
          />
        </div>
      </div>

      {coverPreview && (
        <img
          src={coverPreview}
          alt=""
          className="mt-[clamp(0.75rem,1.2vw,1.4rem)] aspect-[3/2] w-[min(22rem,60vw)] rounded-[clamp(0.6rem,0.9vw,1.1rem)] object-cover"
        />
      )}

      <div className="mt-[clamp(1rem,1.6vw,1.8rem)]">
        <label className={label} htmlFor="post-cover-alt">
          Opis zdjęcia
        </label>
        <input
          id="post-cover-alt"
          className={field}
          type="text"
          value={draft.cover_alt}
          onChange={update('cover_alt')}
        />
        <p className={`${hint} mt-[clamp(0.25rem,0.4vw,0.5rem)]`}>
          Napisz, co widać na zdjęciu, na przykład: kobieta przy laptopie z segregatorem dokumentów.
        </p>
      </div>

      <div className="mt-[clamp(1.5rem,2.2vw,2.5rem)]">
        <div className="flex items-center justify-between gap-[1vw] max-sm:flex-col max-sm:items-start max-sm:gap-[0.75rem]">
          <label className={label} htmlFor="post-body">
            Treść wpisu
          </label>

          <div className="flex flex-wrap gap-[clamp(0.3rem,0.5vw,0.6rem)]">
            <button className={buttonGhost} type="button" onClick={() => surroundSelection('**', '**')}>
              Pogrubienie
            </button>
            <button className={buttonGhost} type="button" onClick={() => startLine('## ')}>
              Nagłówek
            </button>
            <button className={buttonGhost} type="button" onClick={() => startLine('- ')}>
              Lista
            </button>
            <button className={buttonGhost} type="button" onClick={() => surroundSelection('[', '](https://)')}>
              Link
            </button>
            <button className={buttonGhost} type="button" onClick={() => setShowPreview((current) => !current)}>
              {showPreview ? 'Wróć do pisania' : 'Podejrzyj'}
            </button>
          </div>
        </div>

        {showPreview ? (
          <div
            className="post-body mt-[clamp(0.75rem,1.2vw,1.4rem)] rounded-[clamp(0.5rem,0.7vw,0.9rem)] border border-graphite/25 bg-white p-[clamp(1rem,1.6vw,2rem)]"
            dangerouslySetInnerHTML={{ __html: marked.parse(draft.body) }}
          />
        ) : (
          <textarea id="post-body" ref={bodyRef} className={textarea} value={draft.body} onChange={update('body')} />
        )}

        <p className={`${hint} mt-[clamp(0.25rem,0.4vw,0.5rem)]`}>
          Zaznacz fragment tekstu i kliknij Pogrubienie albo Link. Nagłówki dzielą wpis na sekcje i tworzą spis
          treści z boku artykułu.
        </p>
      </div>

      {error && <p className={`${errorBox} mt-[clamp(1rem,1.5vw,1.8rem)]`}>{error}</p>}

      <div className="mt-[clamp(1.5rem,2.2vw,2.5rem)] flex gap-[clamp(0.5rem,0.8vw,1rem)]">
        <button className={buttonPrimary} type="submit" disabled={busy}>
          {busy ? 'Zapisuję' : isNew ? 'Opublikuj wpis' : 'Zapisz zmiany'}
        </button>
        <button className={buttonGhost} type="button" onClick={onCancel} disabled={busy}>
          Anuluj
        </button>
      </div>
    </form>
  );
}
