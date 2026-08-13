export const shell = 'px-[2vw] pb-[8vw] max-lg:px-[4vw]';

export const sectionTitle =
  'font-display text-[clamp(1.5rem,2.8vw,3.5rem)] font-medium uppercase leading-[1.05] text-graphite max-lg:text-[clamp(1.3rem,6.5vw,2.5rem)]';

export const label =
  'block font-display text-[clamp(0.6rem,0.75vw,0.9rem)] font-medium uppercase tracking-[0.25em] text-graphite/60';

export const hint =
  'font-sans text-[clamp(0.8rem,0.9vw,1.05rem)] font-normal leading-[1.5] text-graphite/70 max-lg:text-[clamp(0.8rem,3.2vw,0.95rem)]';

export const field =
  'mt-[clamp(0.6rem,0.9vw,1.2rem)] w-full border-b border-ink/70 bg-transparent pb-[clamp(0.5rem,0.6vw,0.8rem)] font-sans text-[clamp(0.95rem,1.2vw,1.4rem)] font-normal text-ink outline-none transition-colors duration-300 placeholder:text-ink/35 focus:border-ink';

export const textareaField = `${field} resize-y leading-[1.6]`;

export const pill =
  'inline-flex h-[3.25rem] shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink px-[clamp(1.3rem,1.8vw,2.4rem)] font-display text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium uppercase leading-none text-canvas outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-ink/40 disabled:opacity-50 max-lg:h-[2.875rem] max-lg:text-[clamp(0.8rem,3.4vw,1rem)]';

export const pillGhost =
  'inline-flex h-[3.25rem] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-ink/25 px-[clamp(1.3rem,1.8vw,2.4rem)] font-display text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium uppercase leading-none text-graphite outline-none transition-colors duration-300 focus-visible:border-ink disabled:opacity-50 max-lg:h-[2.875rem] max-lg:text-[clamp(0.8rem,3.4vw,1rem)]';

export const textLink =
  'inline-flex cursor-pointer border-b-2 border-graphite/40 pb-[1px] font-display text-[clamp(0.7rem,0.85vw,1rem)] font-medium uppercase tracking-[0.15em] text-graphite/75 outline-none transition-colors duration-300 focus-visible:border-ink focus-visible:text-ink';

export const textLinkStrong = textLink.replace('border-graphite/40', 'border-graphite').replace('text-graphite/75', 'text-graphite');

export const textLinkDanger = textLink
  .replace('border-graphite/40', 'border-alert/50')
  .replace('text-graphite/75', 'text-alert')
  .replace('focus-visible:border-ink focus-visible:text-ink', 'focus-visible:border-alert');

export const coverFrame =
  'relative aspect-[3/2] w-full overflow-hidden rounded-[clamp(1rem,1.5vw,2rem)] bg-placeholder';

export const coverImage = 'h-full w-full object-cover';

export const tileMeta =
  'mt-[clamp(1rem,1.4vw,2rem)] flex items-center gap-[clamp(0.5rem,0.7vw,0.9rem)] font-sans text-[clamp(0.8rem,0.9vw,1.05rem)] font-normal text-graphite/90 max-lg:mt-[4vw] max-lg:text-[clamp(0.78rem,3.1vw,0.95rem)]';

export const tileTitle =
  'mt-[clamp(0.5rem,0.8vw,1.1rem)] font-display text-[clamp(1.15rem,1.9vw,2.5rem)] font-medium uppercase leading-[1.15] text-graphite max-lg:mt-[2.5vw] max-lg:text-[clamp(1.15rem,5.2vw,2rem)]';

export const notice =
  'border-l-2 border-ink/30 pl-[clamp(1rem,1.6vw,2.25rem)] font-sans text-[clamp(0.9rem,1.05vw,1.2rem)] font-medium leading-[1.5] text-ink';

export const noticeError =
  'border-l-2 border-alert pl-[clamp(1rem,1.6vw,2.25rem)] font-sans text-[clamp(0.9rem,1.05vw,1.2rem)] font-medium leading-[1.5] text-ink';
