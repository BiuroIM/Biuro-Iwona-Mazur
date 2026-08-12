export const shell = 'mx-auto w-[min(72rem,92vw)] py-[clamp(2rem,4vw,5rem)]';

export const heading =
  'font-display text-[clamp(1.5rem,2.6vw,2.75rem)] font-medium uppercase leading-[1.05] text-graphite';

export const subheading =
  'font-display text-[clamp(1.05rem,1.5vw,1.5rem)] font-medium uppercase leading-[1.15] text-graphite';

export const label =
  'block font-display text-[clamp(0.65rem,0.8vw,0.85rem)] font-medium uppercase tracking-[0.18em] text-graphite/70';

export const hint =
  'font-sans text-[clamp(0.75rem,0.85vw,0.95rem)] font-normal leading-[1.5] text-graphite/60';

export const field =
  'mt-[clamp(0.4rem,0.6vw,0.75rem)] w-full rounded-[clamp(0.5rem,0.7vw,0.9rem)] border border-graphite/25 bg-white px-[clamp(0.7rem,1vw,1.1rem)] py-[clamp(0.55rem,0.8vw,0.9rem)] font-sans text-[clamp(0.9rem,1vw,1.1rem)] font-normal text-graphite outline-none focus:border-ink focus:ring-2 focus:ring-ink/25';

export const textarea = `${field} min-h-[clamp(18rem,32vw,40rem)] resize-y leading-[1.6]`;

export const buttonPrimary =
  'inline-flex items-center justify-center rounded-full bg-ink px-[clamp(1.1rem,1.6vw,2rem)] py-[clamp(0.55rem,0.8vw,0.95rem)] font-display text-[clamp(0.75rem,0.9vw,1rem)] font-medium uppercase tracking-[0.12em] text-canvas outline-none focus:ring-2 focus:ring-ink/40 disabled:opacity-50';

export const buttonGhost =
  'inline-flex items-center justify-center rounded-full border border-graphite/35 px-[clamp(0.9rem,1.3vw,1.6rem)] py-[clamp(0.45rem,0.7vw,0.85rem)] font-display text-[clamp(0.7rem,0.85vw,0.95rem)] font-medium uppercase tracking-[0.12em] text-graphite outline-none focus:ring-2 focus:ring-ink/30 disabled:opacity-50';

export const buttonDanger = `${buttonGhost} border-alert/50 text-alert`;

export const card =
  'rounded-[clamp(0.9rem,1.3vw,1.6rem)] border border-graphite/20 bg-canvas-deep/40 p-[clamp(1rem,1.6vw,2rem)]';

export const errorBox =
  'rounded-[clamp(0.5rem,0.7vw,0.9rem)] border border-alert/50 bg-alert/10 px-[clamp(0.8rem,1.1vw,1.2rem)] py-[clamp(0.5rem,0.7vw,0.85rem)] font-sans text-[clamp(0.85rem,0.95vw,1rem)] font-normal text-graphite';

export const noticeBox =
  'rounded-[clamp(0.5rem,0.7vw,0.9rem)] border border-ink/30 bg-ink/5 px-[clamp(0.8rem,1.1vw,1.2rem)] py-[clamp(0.5rem,0.7vw,0.85rem)] font-sans text-[clamp(0.85rem,0.95vw,1rem)] font-normal text-graphite';
