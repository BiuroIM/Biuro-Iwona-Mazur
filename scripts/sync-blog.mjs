import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'blog');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets', 'blog');
const MANIFEST = path.join(ROOT, 'scripts', 'generated-posts.json');

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const WORDS_PER_MINUTE = 200;

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

const readingMinutes = (body) => {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

const coverExtension = (url) => {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension) ? extension : '.jpg';
};

const frontmatter = (post, coverFile) => [
  '---',
  `title: ${quote(post.title)}`,
  `lead: ${quote(post.lead)}`,
  `date: ${post.published_at.slice(0, 10)}`,
  `category: ${quote(post.category)}`,
  `readingMinutes: ${readingMinutes(post.body)}`,
  `cover: '../../assets/blog/${coverFile}'`,
  `coverAlt: ${quote(post.cover_alt)}`,
  'softParallax: true',
  '---',
  '',
  post.body.trim(),
  '',
].join('\n');

const readManifest = async () => {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return [];
  }
};

const fetchPosts = async () => {
  const query = new URLSearchParams({
    select: 'slug,title,lead,body,category,cover_url,cover_alt,published_at',
    published: 'eq.true',
    order: 'published_at.desc',
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase odpowiedział ${response.status}: ${await response.text()}`);
  }

  return response.json();
};

const downloadCover = async (post, coverFile) => {
  const response = await fetch(post.cover_url);

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać okładki wpisu "${post.slug}" (${response.status})`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(ASSETS_DIR, coverFile), bytes);
};

const assertNotHandwritten = async (slug, generatedSlugs) => {
  if (generatedSlugs.has(slug)) return;

  const existing = await readdir(POSTS_DIR);

  if (existing.includes(`${slug}.md`)) {
    throw new Error(
      `Wpis "${slug}" z panelu ma taki sam adres jak plik ${slug}.md napisany ręcznie. ` +
        'Zmień tytuł wpisu w panelu albo usuń plik, żeby nie nadpisać treści.'
    );
  }
};

const run = async () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('sync-blog: brak PUBLIC_SUPABASE_URL lub PUBLIC_SUPABASE_ANON_KEY, pomijam pobieranie wpisów z panelu');
    return;
  }

  await mkdir(ASSETS_DIR, { recursive: true });

  const previous = await readManifest();
  const previousSlugs = new Set(previous.map((entry) => entry.slug));
  const posts = await fetchPosts();
  const manifest = [];

  for (const post of posts) {
    await assertNotHandwritten(post.slug, previousSlugs);

    const coverFile = `${post.slug}${coverExtension(post.cover_url)}`;
    await downloadCover(post, coverFile);
    await writeFile(path.join(POSTS_DIR, `${post.slug}.md`), frontmatter(post, coverFile), 'utf8');

    manifest.push({ slug: post.slug, cover: coverFile });
  }

  const currentSlugs = new Set(manifest.map((entry) => entry.slug));
  const removed = previous.filter((entry) => !currentSlugs.has(entry.slug));

  for (const entry of removed) {
    await rm(path.join(POSTS_DIR, `${entry.slug}.md`), { force: true });
    await rm(path.join(ASSETS_DIR, entry.cover), { force: true });
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`sync-blog: ${manifest.length} wpisów z panelu, ${removed.length} usuniętych`);
};

await run();
