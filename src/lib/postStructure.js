const WORDS_PER_MINUTE = 200;

export const readingMinutes = (body) => {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export const outline = (body) =>
  body
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).replace(/\*\*/g, '').trim())
    .filter(Boolean);
