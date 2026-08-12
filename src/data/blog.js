const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const formatDate = (date) => dateFormatter.format(date);

const monthFormatter = new Intl.DateTimeFormat('pl-PL', { month: 'long' });

export const formatDateMonthFirst = (date) => {
  const month = monthFormatter.format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getDate()} ${date.getFullYear()}`;
};

export const isoDate = (date) => date.toISOString().slice(0, 10);

export const readingLabel = (minutes) => `${minutes} min czytania`;

export const newestFirst = (a, b) => b.data.date.valueOf() - a.data.date.valueOf();

export const sortPosts = (posts) => [...posts].sort(newestFirst);

export const splitFeatured = (posts) => {
  const sorted = sortPosts(posts);
  const featured = sorted.find((post) => post.data.featured) ?? sorted[0] ?? null;

  return {
    featured,
    rest: featured ? sorted.filter((post) => post.id !== featured.id) : [],
  };
};

export const countByCategory = (posts) =>
  [...posts.reduce((tally, post) => {
    const category = post.data.category;
    return tally.set(category, (tally.get(category) ?? 0) + 1);
  }, new Map())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'));

export const relatedPosts = (posts, current, limit = 3) => {
  const others = sortPosts(posts).filter((post) => post.id !== current.id);
  const sameCategory = others.filter(
    (post) => post.data.category === current.data.category
  );
  const filler = others.filter(
    (post) => post.data.category !== current.data.category
  );
  return [...sameCategory, ...filler].slice(0, limit);
};
