import { gsap } from 'gsap';

let chatController = null;

export function initChatWidget() {
  const chat = document.querySelector('[data-chat]');
  const card = chat?.querySelector('[data-chat-card]');
  const toggle = chat?.querySelector('[data-chat-toggle]');
  if (!chat || !card || !toggle) return;

  chatController?.abort();
  chatController = new AbortController();
  const { signal } = chatController;

  const icon = toggle.querySelector('[data-chat-icon]');
  const closeIcon = toggle.querySelector('[data-chat-close-icon]');
  const badge = toggle.querySelector('[data-chat-badge]');
  const scroller = card.querySelector('[data-chat-scroll]');
  const log = card.querySelector('[data-chat-log]');
  const typing = card.querySelector('[data-chat-typing]');
  const choices = card.querySelector('[data-chat-choices]');
  const list = card.querySelector('[data-chat-list]');
  const more = card.querySelector('[data-chat-more]');
  const note = card.querySelector('[data-chat-note]');
  const again = card.querySelector('[data-chat-again]');
  const lines = gsap.utils.toArray(card.querySelectorAll('[data-chat-line]'));

  gsap.set(card, { autoAlpha: 0, scale: 0.94, y: 12 });
  gsap.set(lines, { autoAlpha: 0, y: 10 });

  const openTimeline = gsap
    .timeline({ paused: true, defaults: { ease: 'power3.out' } })
    .to(card, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45 }, 0)
    .to(icon, { autoAlpha: 0, duration: 0.2 }, 0)
    .to(closeIcon, { autoAlpha: 1, duration: 0.25 }, 0.08)
    .to(lines, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.12);

  let lastFocus = null;
  const isOpen = () => !card.hasAttribute('inert');

  const open = () => {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    card.removeAttribute('inert');
    card.style.pointerEvents = 'auto';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Zamknij czat pomocniczy');
    if (badge) gsap.to(badge, { autoAlpha: 0, scale: 0.4, duration: 0.25, ease: 'power2.in' });
    openTimeline.timeScale(1).play();
    gsap.delayedCall(0.3, () => {
      if (!isOpen()) return;
      card.focus({ preventScroll: true });
      toBottom();
    });
  };

  const close = () => {
    if (!isOpen()) return;
    card.setAttribute('inert', '');
    card.style.pointerEvents = 'none';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Otwórz czat pomocniczy');
    openTimeline.timeScale(1.6).reverse();
    (card.contains(lastFocus) ? toggle : lastFocus)?.focus?.({ preventScroll: true });
  };

  toggle.addEventListener('click', () => (isOpen() ? close() : open()), { signal });
  card.querySelector('[data-chat-close]')?.addEventListener('click', close, { signal });

  const TYPING_TIME = 900; // ile bot „pisze" przed odpowiedzią

  const PREVIEW = Number(list?.dataset.preview) || 3;
  const items = list ? gsap.utils.toArray(list.querySelectorAll('[data-chat-item]')) : [];
  let busy = false;
  let showAll = false;
  let answerTimer = null;

  const toBottom = () => {
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
  };

  const toRow = (row) => {
    if (!scroller || !row) return;
    const offset =
      scroller.scrollTop + row.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTo({ top: Math.max(0, offset - 4), behavior: 'smooth' });
  };

  const BUBBLE_BOT =
    'max-w-[90%] rounded-[14px] rounded-bl-[4px] bg-canvas/8 px-[14px] py-[9px] font-sans text-[14px] font-normal leading-[1.5] text-canvas/80 max-lg:px-[12px] max-lg:py-[8px] max-lg:text-[12.5px]';
  const BUBBLE_USER =
    'max-w-[85%] rounded-[14px] rounded-br-[4px] bg-canvas px-[14px] py-[9px] font-sans text-[14px] font-medium leading-[1.4] text-ink max-lg:px-[12px] max-lg:py-[8px] max-lg:text-[12.5px]';

  const say = (who, text, reveal = true) => {
    const row = document.createElement('div');
    row.className = who === 'user' ? 'flex justify-end' : 'flex justify-start';
    const message = document.createElement('p');
    message.className = who === 'user' ? BUBBLE_USER : BUBBLE_BOT;
    message.textContent = text;
    row.appendChild(message);
    log.appendChild(row);
    if (reveal) {
      gsap.from(row, { autoAlpha: 0, y: 8, duration: 0.35, ease: 'power2.out' });
      toBottom();
    }
    return row;
  };

  const hideChoices = () =>
    gsap.to(choices, { height: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.out', overwrite: true });

  const refreshChoices = () => {
    const left = items.filter((item) => item.dataset.asked !== 'true');
    items.forEach((item) => {
      const place = left.indexOf(item);
      item.classList.toggle('hidden', place === -1 || (!showAll && place >= PREVIEW));
    });

    const asked = items.length - left.length;
    again?.classList.toggle('hidden', asked === 0 || left.length === 0);

    if (left.length <= PREVIEW) showAll = false;
    more?.classList.toggle('hidden', left.length <= PREVIEW);
    more?.setAttribute('aria-expanded', String(showAll));
    if (more) more.textContent = showAll ? 'Ukryj dodatkowe pytania' : 'Pokaż wszystkie pytania';

    list?.classList.toggle('hidden', left.length === 0);
    note?.classList.toggle('hidden', left.length > 0);
  };

  const ask = (item) => {
    if (busy) return;
    const question = item.querySelector('[data-chat-label]')?.textContent.trim();
    const answer = item.querySelector('[data-chat-answer]')?.textContent.trim();
    if (!question || !answer) return;

    busy = true;
    item.dataset.asked = 'true';

    hideChoices();
    const questionRow = say('user', question);
    typing?.classList.remove('hidden');
    if (typing) gsap.fromTo(typing, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 });
    toBottom();

    clearTimeout(answerTimer);
    answerTimer = setTimeout(() => {
      typing?.classList.add('hidden');
      refreshChoices();

      gsap.set(choices, { height: 'auto' });
      const answerRow = say('bot', answer, false);
      gsap.fromTo(
        [answerRow, choices],
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true }
      );
      toRow(questionRow);
      busy = false;
    }, TYPING_TIME);
  };

  items.forEach((item) => {
    item
      .querySelector('[data-chat-question]')
      ?.addEventListener('click', () => ask(item), { signal });
  });

  more?.addEventListener(
    'click',
    () => {
      showAll = !showAll;
      refreshChoices();
      if (showAll) toBottom();
    },
    { signal }
  );

  refreshChoices();

  card.querySelectorAll('[data-open-form]').forEach((element) => {
    element.addEventListener('click', close, { signal });
  });

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && isOpen()) close();
    },
    { signal }
  );

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (isOpen() && !chat.contains(e.target)) close();
    },
    { signal }
  );
}

export function destroyChat() {
  chatController?.abort();
  chatController = null;
}
