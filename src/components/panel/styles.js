export const shell = 'mx-auto w-[min(60rem,92vw)] pb-[8vw]';

export const sectionTitle =
  'font-display text-[clamp(1.5rem,2.8vw,3.5rem)] font-medium uppercase leading-[1.05] text-graphite max-lg:text-[clamp(1.3rem,6.5vw,2.5rem)]';

export const label =
  'block font-display text-[clamp(0.6rem,0.75vw,0.9rem)] font-medium uppercase tracking-[0.03em] text-graphite/60';

export const hint =
  'font-sans text-[clamp(0.8rem,0.9vw,1.05rem)] font-normal leading-[1.5] text-graphite/70 max-lg:text-[clamp(0.8rem,3.2vw,0.95rem)]';

export const field =
  'mt-[clamp(0.5rem,0.7vw,0.9rem)] w-full rounded-[clamp(0.6rem,0.8vw,1rem)] border border-ink/25 bg-white px-[clamp(0.9rem,1.1vw,1.4rem)] py-[clamp(0.6rem,0.8vw,1rem)] font-sans text-[clamp(0.95rem,1.05vw,1.2rem)] font-normal text-ink outline-none transition-colors duration-300 placeholder:text-ink/35 focus:border-ink focus:ring-2 focus:ring-ink/15';

export const textareaField = `${field} resize-y leading-[1.6]`;

export const pill =
  'inline-flex h-[3.25rem] shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink px-[clamp(1.3rem,1.8vw,2.4rem)] font-display text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium uppercase leading-none text-canvas outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-ink/40 disabled:opacity-50 max-lg:h-[2.875rem] max-lg:text-[clamp(0.8rem,3.4vw,1rem)]';

export const pillGhost =
  'inline-flex h-[3.25rem] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-ink/25 bg-white px-[clamp(1.3rem,1.8vw,2.4rem)] font-display text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium uppercase leading-none text-graphite outline-none transition-colors duration-300 focus-visible:border-ink disabled:opacity-50 max-lg:h-[2.875rem] max-lg:text-[clamp(0.8rem,3.4vw,1rem)]';

export const smallButton =
  'inline-flex cursor-pointer items-center justify-center rounded-full border border-ink/25 bg-white px-[clamp(0.8rem,1vw,1.3rem)] py-[clamp(0.4rem,0.5vw,0.65rem)] font-display text-[clamp(0.65rem,0.78vw,0.9rem)] font-medium uppercase tracking-[0.03em] leading-none text-graphite outline-none transition-colors duration-300 focus-visible:border-ink disabled:opacity-50';

export const smallButtonActive = smallButton
  .replace('border-ink/25 bg-white', 'border-ink bg-ink')
  .replace('text-graphite', 'text-canvas');

export const smallButtonDanger = smallButton
  .replace('border-ink/25', 'border-alert/60')
  .replace('text-graphite', 'text-alert');

export const coverFrame =
  'relative aspect-[3/2] w-full overflow-hidden rounded-[clamp(1rem,1.5vw,2rem)] bg-placeholder';

export const coverImage = 'h-full w-full object-cover';

export const tileMeta =
  'mt-[clamp(1rem,1.4vw,2rem)] flex items-center gap-[clamp(0.5rem,0.7vw,0.9rem)] font-sans text-[clamp(0.8rem,0.9vw,1.05rem)] font-normal text-graphite/90 max-lg:mt-[4vw] max-lg:text-[clamp(0.78rem,3.1vw,0.95rem)]';

export const tileTitle =
  'mt-[clamp(0.5rem,0.8vw,1.1rem)] font-display text-[clamp(1.15rem,1.9vw,2.5rem)] font-medium uppercase leading-[1.15] text-graphite max-lg:mt-[2.5vw] max-lg:text-[clamp(1.15rem,5.2vw,2rem)]';

export const card =
  'rounded-[clamp(0.9rem,1.2vw,1.5rem)] border border-ink/20 bg-white/60 p-[clamp(1.2rem,1.8vw,2.4rem)]';

export const notice =
  'rounded-[clamp(0.6rem,0.8vw,1rem)] border border-ink/25 bg-white/70 px-[clamp(1rem,1.3vw,1.7rem)] py-[clamp(0.7rem,0.9vw,1.2rem)] font-sans text-[clamp(0.88rem,1vw,1.15rem)] font-normal leading-[1.5] text-ink';

export const noticeError =
  'rounded-[clamp(0.6rem,0.8vw,1rem)] border border-alert bg-alert/10 px-[clamp(1rem,1.3vw,1.7rem)] py-[clamp(0.7rem,0.9vw,1.2rem)] font-sans text-[clamp(0.88rem,1vw,1.15rem)] font-normal leading-[1.5] text-ink';
