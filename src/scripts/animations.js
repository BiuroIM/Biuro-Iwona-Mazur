
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

const VARIANTS = {
  'fade-in': { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } },
  'fade-up': { from: { autoAlpha: 0, y: 40 }, to: { autoAlpha: 1, y: 0 } },
  'fade-down': { from: { autoAlpha: 0, y: -40 }, to: { autoAlpha: 1, y: 0 } },
  'fade-left': { from: { autoAlpha: 0, x: 40 }, to: { autoAlpha: 1, x: 0 } },
  'fade-right': { from: { autoAlpha: 0, x: -40 }, to: { autoAlpha: 1, x: 0 } },
  'zoom-in': { from: { autoAlpha: 0, scale: 0.9 }, to: { autoAlpha: 1, scale: 1 } },
};

let lenis = null;
let tickerCallback = null;
let faqController = null;
let formController = null;
let pageFormController = null;
let navbarController = null;
let menuController = null;
let scrollBarController = null;
let chatController = null;
let selectController = null;
let cursorController = null;
let menuCollapse = null;

let curtainOpen = false;
let afterCurtainOpen = [];

function openCurtainGate() {
  curtainOpen = true;
  const queue = afterCurtainOpen;
  afterCurtainOpen = [];
  queue.forEach((task) => task());
}

function holdUnderCurtain() {
  if (curtainOpen) return;

  const held = ScrollTrigger.getAll()
    .filter((st) => st.animation && !st.vars.scrub)
    .map((st) => st.animation);
  if (!held.length) return;

  held.forEach((animation) => animation.pause(0));

  afterCurtainOpen.push(() => {
    held.forEach((animation) => {
      const st = animation.scrollTrigger;
      if (!st) {
        animation.play();
        return;
      }

      if (st.scroll() > st.end) animation.progress(1);
      else if (st.isActive) animation.play();
    });
  });
}

function restoreStatesAfterRefresh() {
  ScrollTrigger.getAll().forEach((st) => {
    const animation = st.animation;
    if (!animation) return;
    if (animation.isActive?.()) return;

    const item = animation.progress();
    animation.invalidate();
    animation.progress(1, true).progress(item, true);
  });
}

ScrollTrigger.addEventListener('refresh', restoreStatesAfterRefresh);

function initLenis() {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  tickerCallback = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);
}

function initAnimations() {
  gsap.utils.toArray('[data-animate]').forEach((el) => {
    const variant = VARIANTS[el.dataset.animate] ?? VARIANTS['fade-up'];

    gsap.fromTo(el, variant.from, {
      ...variant.to,
      duration: parseFloat(el.dataset.duration ?? '0.8'),
      delay: parseFloat(el.dataset.delay ?? '0'),
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: el.dataset.start ?? 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

}

function initLineReveal() {
  gsap.utils.toArray('[data-reveal-lines]').forEach((el) => {
    const lines = el.querySelectorAll('.reveal-line');
    if (!lines.length) return;

    const once = el.dataset.revealLines === 'once';

    const fromTop = el.dataset.direction === 'down';
    const from = fromTop ? -110 : 110;

    const trigger = el.dataset.trigger
      ? (el.closest(el.dataset.trigger) ??
        document.querySelector(el.dataset.trigger) ??
        el)
      : el;
    const endTriggerEl = el.dataset.endTrigger ? el.closest(el.dataset.endTrigger) : null;

    gsap.fromTo(
      lines,
      { yPercent: from },
      {
        yPercent: 0,
        duration: parseFloat(el.dataset.duration ?? '0.9'),
        delay: parseFloat(el.dataset.delay ?? '0'),
        stagger: parseFloat(el.dataset.stagger ?? '0.12'),
        ease: 'power3.out',
        scrollTrigger: {
          trigger,
          ...(endTriggerEl ? { endTrigger: endTriggerEl } : {}),
          start: el.dataset.start ?? 'top 85%',
          end: el.dataset.end ?? 'bottom top',
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }
    );
  });
}

function initWordScrub() {
  gsap.utils.toArray('[data-words-scrub]').forEach((el) => {
    const start = parseFloat(el.dataset.from ?? '0.6');
    const endPos = parseFloat(el.dataset.to ?? '1');

    if (!el.dataset.split) {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map((w) => `<span class="scrub-word">${w}</span>`)
        .join(' ');
      el.dataset.split = 'true';
    }

    const spans = el.querySelectorAll('.scrub-word');
    if (!spans.length) return;

    gsap.fromTo(
      spans,
      { opacity: start },
      {
        opacity: endPos,
        ease: 'none',
        stagger: 0.8,
        scrollTrigger: {
          trigger: el,
          start: el.dataset.start ?? 'top 80%',
          end: el.dataset.end ?? 'top 30%',
          scrub: true,
        },
      }
    );
  });
}

function initCounters() {
  gsap.utils.toArray('[data-counter]').forEach((el) => {
    if (!el.dataset.counterRaw) el.dataset.counterRaw = el.textContent.trim();
    const raw = el.dataset.counterRaw;

    const found = raw.match(/\d[\d\s.,]*/);
    if (!found) return;

    const target = parseInt(found[0].replace(/\D/g, ''), 10);
    const prefix = raw.slice(0, found.index);
    const suffix = raw.slice(found.index + found[0].length);

    const state = { value: 0 };
    const write = () => {
      el.textContent = prefix + Math.round(state.value) + suffix;
    };
    write();

    gsap.to(state, {
      value: target,
      duration: parseFloat(el.dataset.duration ?? '2.4'),
      delay: parseFloat(el.dataset.delay ?? '0'),
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate: write,
      scrollTrigger: {
        trigger: el.dataset.trigger ? (el.closest(el.dataset.trigger) ?? el) : el,
        start: el.dataset.start ?? 'top 98%',
        toggleActions: 'play none none none',
      },
    });
  });
}

function initImageReveal() {
  gsap.utils.toArray('[data-image-reveal]').forEach((el) => {
    const panel = el.querySelector('.reveal-panel');
    if (!panel) return;

    const rect = el.getBoundingClientRect();
    const width = window.innerWidth || 1;
    const fractionX = Math.min(1, Math.max(0, (rect.left + rect.width / 2) / width));
    const spreadX = parseFloat(el.dataset.staggerX ?? '0.3');
    const desktopDelay = isDesktopWidth()
      ? parseFloat(el.dataset.delayDesktop ?? '0')
      : 0;
    const delay =
      parseFloat(el.dataset.delay ?? '0') + desktopDelay + fractionX * spreadX;

    const trigger = el.dataset.trigger
      ? (el.closest(el.dataset.trigger) ??
        document.querySelector(el.dataset.trigger) ??
        el)
      : el;

    gsap
      .timeline({
        scrollTrigger: {
          trigger,
          start: el.dataset.start ?? 'top 80%',
          toggleActions: 'play none none none',
        },
      })
      .fromTo(
        panel,
        { scaleY: 1 },
        {
          scaleY: 0,
          transformOrigin: 'bottom center',
          ease: 'power3.inOut',
          duration: parseFloat(el.dataset.duration ?? '1.1'),
        },
        delay
      );
  });
}

function initImageGrow() {
  gsap.utils.toArray('[data-image-grow]').forEach((el) => {
    const toPercent = parseFloat(el.dataset.do ?? '100');

    const parentBox = () => {
      const parent = el.parentElement;
      if (!parent) return window.innerWidth;
      const styleNode = getComputedStyle(parent);
      return (
        parent.clientWidth - parseFloat(styleNode.paddingLeft) - parseFloat(styleNode.paddingRight)
      );
    };

    gsap.fromTo(
      el,
      { scale: 1 },
      {
        scale: () => ((toPercent / 100) * parentBox()) / el.offsetWidth,
        ease: 'none',
        transformOrigin: 'top center',
        scrollTrigger: {
          trigger: el,
          start: el.dataset.start ?? 'top 65%',
          end: el.dataset.end ?? 'top 15%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });
}

const colorToken = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const isDesktopWidth = () => window.matchMedia('(min-width: 64rem)').matches;

function initProgressBar() {
  gsap.utils.toArray('[data-progress-bar]').forEach((fill) => {
    const selector = fill.dataset.trigger;
    const range = selector
      ? fill.closest(selector)
      : fill.closest('section');
    if (!range) return;

    const track = fill.parentElement;
    const icon = track?.querySelector('[data-progress-icon]');
    const vertical = fill.dataset.progressAxis === 'y';

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: range,
        start: fill.dataset.start ?? 'top top',
        end: fill.dataset.end ?? 'bottom bottom',
        scrub: true,
      },
    });

    timeline.fromTo(
      fill,
      vertical ? { scaleY: 0 } : { scaleX: 0 },
      {
        ...(vertical ? { scaleY: 1 } : { scaleX: 1 }),
        ease: 'none',
        duration: 1,
        transformOrigin: vertical ? 'center top' : 'left center',
      },
      0
    );

    const trackSize = vertical ? track?.offsetHeight : track?.offsetWidth;

    if (icon && trackSize) {
      const iconCenter = vertical
        ? icon.offsetTop + icon.offsetHeight / 2
        : icon.offsetLeft + icon.offsetWidth / 2;
      const moment = Math.min(0.98, Math.max(0, iconCenter / trackSize));

      timeline.fromTo(
        icon,
        { color: colorToken('--color-canvas') },
        { color: colorToken('--color-ink'), ease: 'none', duration: 0.02 },
        moment
      );
    }

    if (track) {
      timeline.to(
        track,
        { autoAlpha: 0, ease: 'none', duration: parseFloat(fill.dataset.fade ?? '0.06') },
        1
      );
    }
  });
}

function initDarkBackground() {
  const sections = gsap.utils.toArray('[data-dark-bg]');
  if (!sections.length) return;

  const layer = document.querySelector('[data-dark-bg-layer]');
  if (!layer) return;

  gsap.set(layer, { autoAlpha: 0 });

  sections.forEach((section) => {
    gsap.to(layer, {
      autoAlpha: 1,
      duration: parseFloat(section.dataset.bgTime ?? '0.5'),
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: section,
        start: section.dataset.start ?? 'top top',
        end: section.dataset.end ?? 'bottom top',
        toggleActions: 'play reverse play reverse',
      },
    });
  });
}

function initLogoWall() {
  gsap.utils.toArray('[data-logo-wall]').forEach((wall) => {
    const columns = gsap.utils
      .toArray(wall.querySelectorAll('[data-logo-col]'))
      .filter((col) => col.offsetHeight > 0);
    const n = columns.length;
    if (!n) return;

    const vh = () => (window.innerHeight || 800) / 100;
    const startBottom = parseFloat(wall.dataset.start ?? '100');
    const descent = parseFloat(wall.dataset.colDrop ?? '10');
    const step = parseFloat(wall.dataset.colDelay ?? '0.25');
    const baseDur = parseFloat(wall.dataset.duration ?? '1');
    const gap = parseFloat(wall.dataset.exitMargin ?? '10');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wall,
        start: 'top center',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    columns.forEach((col, i) => {
      const fromRight = n - 1 - i;

      tl.fromTo(
        col,
        { y: () => (startBottom + fromRight * descent) * vh() },
        {
          y: () => -(col.offsetHeight + gap * vh()),
          ease: 'none',
          duration: baseDur + i * step,
          force3D: true,
        },
        fromRight * step
      );
    });
  });
}

function initCards() {
  gsap.utils.toArray('[data-cards]').forEach((zone) => {
    const cards = gsap.utils.toArray(zone.querySelectorAll('[data-card]'));
    if (!cards.length) return;

    const section = zone.closest('[data-cards-section]') ?? zone;
    const step = parseFloat(zone.dataset.step ?? '0.85');
    const time = parseFloat(zone.dataset.time ?? '1');
    const rotateStart = parseFloat(zone.dataset.rotateStart ?? '-12');
    const scaleStart = parseFloat(zone.dataset.scaleStart ?? '0.82');
    const isNarrow = () => window.matchMedia('(max-width: 1023px)').matches;
    const readNumber = (key, fallback) => {
      const forNarrow = zone.dataset[`${key}MaxLg`];
      const chosen = isNarrow() && forNarrow != null ? forNarrow : zone.dataset[key];
      return parseFloat(chosen ?? fallback);
    };

    const stepX = () => readNumber('shiftX', '1.6');
    const stepY = () => readNumber('shiftY', '1.6');
    const baseX = () => readNumber('baseX', '0');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card, i) => {
      const endRotation = parseFloat(card.dataset.rotate ?? '0');

      const targetX = () => ((baseX() + i * stepX()) * window.innerWidth) / 100;

      const targetY = () => {
        const step = stepY();
        const centering = ((cards.length - 1) * step) / 2;
        return ((centering - i * step) * window.innerHeight) / 100;
      };

      tl.fromTo(
        card,
        {
          x: targetX,
          y: () => window.innerHeight,
          rotation: rotateStart,
          scale: scaleStart,
        },
        {
          x: targetX,
          y: targetY,
          rotation: endRotation,
          scale: 1,
          ease: 'none',
          duration: time,
        },
        i * step
      );
    });
  });
}

function prepareExtra(extra) {
  extra.querySelectorAll('[data-extra-words]').forEach((el) => {
    if (el.dataset.split) return;

    el.innerHTML = el.textContent
      .trim()
      .split(/\s+/)
      .map(
        (word) =>
          `<span class="-mb-[0.18em] inline-block overflow-hidden align-bottom">` +
          `<span class="extra-line block pb-[0.18em]">${word}</span></span>`
      )
      .join(' ');

    el.dataset.split = 'true';
  });

  return gsap.utils.toArray(extra.querySelectorAll('.extra-line'));
}

function initHeadlinePin() {
  gsap.utils.toArray('[data-headline-pin]').forEach((section) => {
    const groups = gsap.utils.toArray(section.querySelectorAll('[data-headline-group]'));
    const blocks = groups.length ? groups : [section];

    const stagger = parseFloat(section.dataset.stagger ?? '0.08');
    const entry = parseFloat(section.dataset.in ?? '2');
    const hold = parseFloat(section.dataset.hold ?? '0.8');
    const exit = parseFloat(section.dataset.out ?? '1.2');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    blocks.forEach((block) => {
      const lines = gsap.utils.toArray(block.querySelectorAll('.headline-line'));
      if (!lines.length) return;

      const extra = block.querySelector('[data-headline-extra]');
      const extraParts = extra ? prepareExtra(extra) : [];

      tl.fromTo(
        lines,
        { yPercent: 110 },
        { yPercent: 0, ease: 'power3.out', duration: entry, stagger }
      );

      if (extraParts.length) {
        tl.fromTo(
          extraParts,
          { yPercent: 110 },
          {
            yPercent: 0,
            ease: 'power3.out',
            duration: entry * 0.4,
            stagger: parseFloat(section.dataset.extraStagger ?? '0.04'),
          },
          '>-0.5'
        );
      } else if (extra) {
        tl.fromTo(
          extra,
          { autoAlpha: 0, y: '3vh' },
          { autoAlpha: 1, y: 0, ease: 'power2.out', duration: entry * 0.5 },
          '>-0.4'
        );
      }

      tl.to({}, { duration: hold });

      if (block.hasAttribute('data-stays')) return;

      tl.to(lines, { yPercent: -110, ease: 'power3.in', duration: exit, stagger });
      if (extraParts.length) {
        tl.to(
          extraParts,
          { yPercent: -110, ease: 'power3.in', duration: exit, stagger: 0.02 },
          '<'
        );
      } else if (extra) {
        tl.to(extra, { autoAlpha: 0, duration: exit * 0.5 }, '<');
      }
    });
  });
}

function initFooterTransition() {
  gsap.utils.toArray('[data-footer-transition]').forEach((section) => {
    const panels = gsap.utils.toArray(section.querySelectorAll('[data-panel]'));
    if (!panels.length) return;

    const content = section.querySelector('[data-footer-content]');
    const stagger = parseFloat(section.dataset.stagger ?? '0.35');
    const time = parseFloat(section.dataset.time ?? '1');
    const hold = parseFloat(section.dataset.hold ?? '0.6');

    gsap.set(panels, { scaleY: 0, transformOrigin: 'top center' });
    if (content) gsap.set(content, { autoAlpha: 0, y: '4vh' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: section.dataset.start ?? 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    tl.to(panels, { scaleY: 1, ease: 'none', stagger, duration: time });
    if (content) {
      tl.to(content, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.6 }, '>-0.1');
    }
    tl.to({}, { duration: hold });
  });
}

function initActiveList() {
  gsap.utils.toArray('[data-active-list]').forEach((list) => {
    const items = gsap.utils.toArray(list.querySelectorAll('[data-active-item]'));

    items.forEach((item) => {
      item.dataset.active = 'false';

      ScrollTrigger.create({
        trigger: item,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          item.dataset.active = String(self.isActive);
        },
      });
    });
  });
}

function initRope() {
  gsap.utils.toArray('[data-rope]').forEach((section) => {
    const path = section.querySelector('[data-rope-path]');
    const blocks = gsap.utils.toArray(section.querySelectorAll('[data-rope-block]'));
    const frames = gsap.utils.toArray(section.querySelectorAll('[data-rope-frame]'));
    if (!path || !blocks.length) return;

    let length = 0;
    const frameLengths = [];

    const perimeter = (w, h, r) => 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;

    const build = () => {
      const sectionFrame = section.getBoundingClientRect();

      const thickness = parseFloat(getComputedStyle(path).strokeWidth) || 2;
      const jointGap = thickness;

      const relativeTo = (el) => {
        const r = el.getBoundingClientRect();
        return {
          L: r.left - sectionFrame.left,
          P: r.right - sectionFrame.left,
          G: r.top - sectionFrame.top,
          D: r.bottom - sectionFrame.top,
        };
      };

      const centerX = sectionFrame.width / 2;

      let d = `M ${centerX} 0`;
      let leave = { x: centerX, y: 0 };

      blocks.forEach((block, i) => {
        const { L, P, G, D } = relativeTo(block);
        const cssRadius = parseFloat(getComputedStyle(block).borderTopLeftRadius) || 0;
        const r = Math.min(cssRadius, (P - L) / 2, (D - G) / 2);

        const onLeft = (L + P) / 2 < centerX;

        const jointX = onLeft ? P + jointGap : L - jointGap;

        const centerY = (G + D) / 2;

        const margin = (centerY - leave.y) * 0.5;
        d += ` C ${leave.x} ${leave.y + margin}, ${jointX} ${centerY - margin}, ${jointX} ${centerY}`;
        leave = { x: jointX, y: centerY };

        const frame = frames[i];
        if (!frame) return;

        frame.setAttribute('x', L);
        frame.setAttribute('y', G);
        frame.setAttribute('width', Math.max(0, P - L));
        frame.setAttribute('height', Math.max(0, D - G));
        frame.setAttribute('rx', r);

        const frameLength =
          typeof frame.getTotalLength === 'function'
            ? frame.getTotalLength()
            : perimeter(P - L, D - G, r);

        frameLengths[i] = frameLength;
        gsap.set(frame, { strokeDasharray: frameLength });
      });

      const tailMargin = (sectionFrame.height - leave.y) * 0.5;
      d += ` C ${leave.x} ${leave.y + tailMargin}, ${centerX} ${sectionFrame.height - tailMargin}, ${centerX} ${sectionFrame.height}`;

      path.setAttribute('d', d);

      length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length });
    };

    build();

    gsap.fromTo(
      path,
      { strokeDashoffset: () => length },
      {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: build,
        },
      }
    );

    blocks.forEach((block, i) => {
      const frame = frames[i];
      if (!frame) return;

      gsap.fromTo(
        frame,
        { strokeDashoffset: () => frameLengths[i] ?? 0 },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: block,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  });
}

function initScrollBar() {
  const bar = document.querySelector('[data-scroll-bar]');
  if (!bar) return;

  gsap.fromTo(
    bar,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 0,
        end: 'max',
        scrub: true,
      },
    }
  );

  pinBarToBottom(bar.closest('[data-scroll-bar-holder]'));
}

function pinBarToBottom(holder) {
  const visual = window.visualViewport;
  if (!holder || !visual) return;

  scrollBarController?.abort();
  scrollBarController = new AbortController();
  const { signal } = scrollBarController;

  let last = null;
  let scheduled = false;

  const align = () => {
    scheduled = false;
    const shift = Math.round(
      visual.offsetTop + visual.height - document.documentElement.clientHeight
    );
    if (shift === last) return;
    last = shift;
    holder.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : '';
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(align);
  };

  visual.addEventListener('resize', schedule, { signal });
  visual.addEventListener('scroll', schedule, { signal });
  window.addEventListener('scroll', schedule, { passive: true, signal });
  align();
}

const HORIZONTAL_MARGIN = 1;

function initHorizontal() {
  gsap.utils.toArray('[data-horizontal]').forEach((section) => {
    const track = section.querySelector('[data-horizontal-track]');
    if (!track) return;

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const margin = () => {
      const pinned = section.offsetHeight - window.innerHeight;
      if (pinned <= 0) return 0;
      return (distance() * window.innerHeight * HORIZONTAL_MARGIN) / pinned;
    };

    gsap.fromTo(
      track,
      { x: () => margin() },
      {
        x: () => -(distance() + margin()),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: `top ${HORIZONTAL_MARGIN * 100}%`,
          end: `bottom ${100 - HORIZONTAL_MARGIN * 100}%`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });
}

function initFaq() {
  faqController?.abort();
  faqController = new AbortController();
  const { signal } = faqController;

  const items = gsap.utils.toArray('[data-faq]');
  const timelines = new Map();

  const apply = (element, isOpen) => {
    const button = element.querySelector('[data-faq-button]');
    const panel = element.querySelector('[data-faq-answer]');
    const backdrop = element.querySelector('[data-faq-bg]');
    if (!button || !panel || !backdrop) return;

    element.dataset.open = String(isOpen);
    button.setAttribute('aria-expanded', String(isOpen));

    timelines.get(element)?.kill();

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => ScrollTrigger.refresh(),
    });

    if (isOpen) {
      timeline.to(backdrop, { scaleY: 1, duration: 0.25 }, 0).to(
        panel,
        { height: 'auto', duration: 0.4 },
        0
      );
    } else {
      timeline.to(panel, { height: 0, duration: 0.35 }, 0).to(backdrop, { scaleY: 0, duration: 0.25 }, 0.12);
    }

    timelines.set(element, timeline);
  };

  items.forEach((element) => {
    const button = element.querySelector('[data-faq-button]');
    const panel = element.querySelector('[data-faq-answer]');
    const backdrop = element.querySelector('[data-faq-bg]');
    if (!button || !panel || !backdrop) return;

    gsap.set(panel, { height: 0, autoAlpha: 1 });
    gsap.set(backdrop, { scaleY: 0, transformOrigin: 'top center' });
    element.dataset.open = 'false';
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener(
      'click',
      () => {
        const isOpen = element.dataset.open !== 'true';

        if (isOpen) {
          items
            .filter((other) => other !== element && other.dataset.open === 'true')
            .forEach((other) => apply(other, false));
        }

        apply(element, isOpen);
      },
      { signal }
    );
  });
}

function bindFormSteps(root, signal) {
  const form = root.querySelector('[data-form-node]');
  const thanks = root.querySelector('[data-form-thanks]');
  const steps = gsap.utils.toArray(root.querySelectorAll('[data-step]'));
  const bar = root.querySelector('[data-form-progress]');
  const number = root.querySelector('[data-form-number]');

  const UNCOVERED = 'inset(0% 0% 0% 0%)';
  const COLLAPSED_RIGHT = 'inset(0% 0% 0% 100%)';
  const COLLAPSED_LEFT = 'inset(0% 100% 0% 0%)';

  let activeStep = 0;

  const setProgress = (index) => {
    if (bar) {
      gsap.to(bar, {
        scaleX: (index + 1) / steps.length,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
    if (number) number.textContent = String(index + 1).padStart(2, '0');
  };

  if (bar) gsap.set(bar, { scaleX: 1 / Math.max(steps.length, 1), transformOrigin: 'left center' });

  const showStep = (index, direction = 1) => {
    const older = steps[activeStep];
    const newer = steps[index];
    if (!newer || older === newer) return;

    gsap
      .timeline()
      .to(older, {
        clipPath: direction > 0 ? COLLAPSED_RIGHT : COLLAPSED_LEFT,
        duration: 0.35,
        ease: 'power2.in',
      })
      .add(() => {
        older.classList.add('hidden');
        older.classList.remove('flex');
        newer.classList.remove('hidden');
        newer.classList.add('flex');
      })
      .fromTo(
        newer,
        { clipPath: direction > 0 ? COLLAPSED_LEFT : COLLAPSED_RIGHT },
        { clipPath: UNCOVERED, duration: 0.5, ease: 'power3.out' }
      )
      .fromTo(
        newer.querySelectorAll('[data-form-field]'),
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' },
        '<0.1'
      )
      .set(newer, { clipPath: 'none' });

    activeStep = index;
    setProgress(index);
  };

  const isStepValid = (step) => {
    for (const control of step.querySelectorAll('input, textarea, select')) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
    }
    return true;
  };

  root.querySelectorAll('[data-next]').forEach((el) => {
    el.addEventListener(
      'click',
      () => {
        if (isStepValid(steps[activeStep])) showStep(activeStep + 1, 1);
      },
      { signal }
    );
  });

  root.querySelectorAll('[data-reverse]').forEach((el) => {
    el.addEventListener('click', () => showStep(activeStep - 1, -1), { signal });
  });

  form?.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();

      if (activeStep < steps.length - 1) {
        if (isStepValid(steps[activeStep])) showStep(activeStep + 1, 1);
        return;
      }

      if (!isStepValid(steps[activeStep])) return;

      if (bar) gsap.to(bar, { scaleX: 1, duration: 0.6, ease: 'power2.out' });

      gsap
        .timeline()
        .to(form, { autoAlpha: 0, y: -20, duration: 0.3, ease: 'power2.in' })
        .add(() => {
          form.classList.add('hidden');
          thanks?.classList.remove('hidden');
        })
        .fromTo(
          thanks,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }
        );
    },
    { signal }
  );

  const resetForm = () => {
    form?.reset();
    form?.classList.remove('hidden');
    gsap.set(form, { autoAlpha: 1, y: 0 });
    thanks?.classList.add('hidden');

    steps.forEach((step, i) => {
      step.classList.toggle('hidden', i !== 0);
      step.classList.toggle('flex', i === 0);
      gsap.set(step, { clipPath: UNCOVERED });
    });
    gsap.set(steps[0]?.querySelectorAll('[data-form-field]') ?? [], { autoAlpha: 1, y: 0 });
    activeStep = 0;
    if (number) number.textContent = '01';
    if (bar) gsap.set(bar, { scaleX: 1 / Math.max(steps.length, 1) });
  };

  return { resetForm };
}

function initPageForm() {
  const root = document.querySelector('[data-form-page]');
  if (!root) return;

  pageFormController?.abort();
  pageFormController = new AbortController();

  bindFormSteps(root, pageFormController.signal);
}

function initHoverCursor() {
  const cursor = document.querySelector('[data-cursor]');
  const targets = gsap.utils.toArray('[data-cursor-label]');
  if (!cursor || !targets.length) return;

  cursorController?.abort();
  cursorController = new AbortController();
  const { signal } = cursorController;

  const label = cursor.querySelector('[data-cursor-text]');

  gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0.4, autoAlpha: 0 });

  const moveX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
  const moveY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

  let active = null;

  const show = (target, event) => {
    active = target;
    if (label) label.textContent = target.dataset.cursorLabel;
    gsap.set(cursor, { x: event.clientX, y: event.clientY });
    gsap.to(cursor, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'power3.out' });
  };

  const hide = () => {
    if (!active) return;
    active = null;
    gsap.to(cursor, { scale: 0.4, autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
  };

  targets.forEach((target) => {
    target.addEventListener(
      'pointerenter',
      (event) => {
        if (event.pointerType !== 'mouse') return;
        show(target, event);
      },
      { signal }
    );

    target.addEventListener(
      'pointerleave',
      (event) => {
        if (event.pointerType !== 'mouse') return;
        hide();
      },
      { signal }
    );
  });

  window.addEventListener(
    'pointermove',
    (event) => {
      if (!active || event.pointerType !== 'mouse') return;
      moveX(event.clientX);
      moveY(event.clientY);
    },
    { signal, passive: true }
  );

  window.addEventListener('blur', hide, { signal });
}

function initPhotoTone() {
  gsap.utils.toArray('[data-photo-tone]').forEach((photo) => {
    const frame = photo.closest('[data-image-reveal]') ?? photo;

    photo.dataset.inView = 'false';

    ScrollTrigger.create({
      trigger: frame,
      start: photo.dataset.toneStart ?? 'top 85%',
      end: photo.dataset.toneEnd ?? 'bottom 15%',
      onToggle: (self) => {
        photo.dataset.inView = String(self.isActive);
      },
    });
  });
}

function initCustomSelect() {
  const roots = gsap.utils.toArray('[data-select]');
  if (!roots.length) return;

  selectController?.abort();
  selectController = new AbortController();
  const { signal } = selectController;

  let openRoot = null;

  const build = (root) => {
    const native = root.querySelector('[data-select-native]');
    const trigger = root.querySelector('[data-select-trigger]');
    const list = root.querySelector('[data-select-list]');
    const value = root.querySelector('[data-select-value]');
    const chevron = root.querySelector('[data-select-chevron]');
    const options = gsap.utils.toArray(root.querySelectorAll('[data-select-option]'));
    if (!native || !trigger || !list || !value || !options.length) return null;

    const placeholder = value.textContent;
    const row = root.closest('[data-form-field]');
    const layer = row ?? root;
    let activeIndex = -1;
    let isOpen = false;

    gsap.set(list, { autoAlpha: 0, y: -8 });
    list.style.pointerEvents = 'none';

    const markActive = (index) => {
      activeIndex = index;
      options.forEach((option, i) => {
        option.dataset.active = String(i === index);
      });
      list.setAttribute(
        'aria-activedescendant',
        index >= 0 ? options[index].id : ''
      );
      if (index >= 0) options[index].scrollIntoView({ block: 'nearest' });
    };

    const open = () => {
      if (isOpen) return;
      openRoot?.close();
      isOpen = true;
      openRoot = api;
      layer.style.zIndex = '40';
      trigger.setAttribute('aria-expanded', 'true');
      list.style.pointerEvents = 'auto';
      gsap.to(list, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power3.out' });
      gsap.to(chevron, { rotate: 180, duration: 0.28, ease: 'power2.out' });
      markActive(options.findIndex((option) => option.dataset.value === native.value));
    };

    const close = ({ focusTrigger = false } = {}) => {
      if (!isOpen) return;
      isOpen = false;
      if (openRoot === api) openRoot = null;
      trigger.setAttribute('aria-expanded', 'false');
      list.style.pointerEvents = 'none';
      markActive(-1);
      gsap.to(list, {
        autoAlpha: 0,
        y: -8,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          layer.style.zIndex = '';
        },
      });
      gsap.to(chevron, { rotate: 0, duration: 0.2, ease: 'power2.in' });
      if (focusTrigger) trigger.focus();
    };

    const pick = (index) => {
      const option = options[index];
      if (!option) return;
      native.value = option.dataset.value;
      native.dispatchEvent(new Event('change', { bubbles: true }));
      value.textContent = option.dataset.value;
      value.dataset.empty = 'false';
      options.forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
      close({ focusTrigger: true });
    };

    const reset = () => {
      native.value = '';
      value.textContent = placeholder;
      value.dataset.empty = 'true';
      options.forEach((option) => option.setAttribute('aria-selected', 'false'));
      close();
    };

    const step = (delta) => {
      if (!isOpen) {
        open();
        return;
      }
      const next = (activeIndex + delta + options.length) % options.length;
      markActive(next);
    };

    const api = { root, open, close, reset, isOpen: () => isOpen };

    trigger.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        if (isOpen) close();
        else open();
      },
      { signal }
    );

    trigger.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          step(e.key === 'ArrowDown' ? 1 : -1);
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isOpen && activeIndex >= 0) pick(activeIndex);
          else open();
          return;
        }
        if (e.key === 'Home' || e.key === 'End') {
          if (!isOpen) return;
          e.preventDefault();
          markActive(e.key === 'Home' ? 0 : options.length - 1);
          return;
        }
        if (e.key === 'Escape') close();
        if (e.key === 'Tab') close();
      },
      { signal }
    );

    options.forEach((option, i) => {
      option.addEventListener('click', () => pick(i), { signal });
    });

    if (row) {
      row.addEventListener(
        'click',
        (e) => {
          if (list.contains(e.target) || trigger.contains(e.target)) return;
          if (isOpen) close();
          else {
            open();
            trigger.focus();
          }
        },
        { signal }
      );
    }

    root.closest('form')?.addEventListener('reset', () => gsap.delayedCall(0, reset), { signal });

    return api;
  };

  const instances = roots.map(build).filter(Boolean);

  document.addEventListener(
    'pointerdown',
    (e) => {
      instances.forEach((instance) => {
        if (instance.isOpen() && !instance.root.contains(e.target)) instance.close();
      });
    },
    { signal }
  );
}

function initContactForm() {
  const root = document.querySelector('[data-form]');
  if (!root) return;

  formController?.abort();
  formController = new AbortController();
  const { signal } = formController;

  const backdrop = root.querySelector('[data-form-backdrop]');
  const panel = root.querySelector('[data-form-panel]');
  const blocks = gsap.utils.toArray(root.querySelectorAll('[data-form-block]'));
  const parts = gsap.utils.toArray(root.querySelectorAll('[data-form-field]'));

  const COVERED = 'inset(0% 0% 0% 100%)';
  const UNCOVERED = 'inset(0% 0% 0% 0%)';

  gsap.set(panel, { clipPath: COVERED });
  gsap.set(blocks, { clipPath: COVERED });
  gsap.set(backdrop, { autoAlpha: 0 });
  gsap.set(parts, { autoAlpha: 0, x: 24 });

  const timeline = gsap
    .timeline({ paused: true, defaults: { ease: 'power3.out' } })
    .to(backdrop, { autoAlpha: 1, duration: 0.5 }, 0)
    .to(panel, { clipPath: UNCOVERED, duration: 0.7, ease: 'power4.inOut' }, 0)
    .to(blocks, { clipPath: UNCOVERED, duration: 0.6, stagger: 0.12 }, 0.2)
    .to(parts, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.05 }, 0.45);

  const { resetForm } = bindFormSteps(root, signal);

  let lastFocus = null;
  const isOpen = () => !root.hasAttribute('inert');

  const open = () => {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    root.removeAttribute('inert');
    root.style.pointerEvents = 'auto';
    lenis?.stop();
    timeline.play();
    gsap.delayedCall(0.35, () => panel?.querySelector('input, textarea')?.focus());
  };

  const close = () => {
    if (!isOpen()) return;
    root.setAttribute('inert', '');
    root.style.pointerEvents = 'none';
    lenis?.start();
    timeline.reverse();
    lastFocus?.focus?.();

    gsap.delayedCall(0.7, () => {
      if (isOpen()) return;
      resetForm();
    });
  };

  document.querySelectorAll('[data-open-form]').forEach((el) => {
    el.addEventListener(
      'click',
      (e) => {
        e.preventDefault(); // wyzwalaczami bywają linki (<a href="#">)
        open();
      },
      { signal }
    );
  });

  root.querySelectorAll('[data-close-form]').forEach((el) => {
    el.addEventListener('click', close, { signal });
  });

  backdrop?.addEventListener('click', close, { signal });

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && isOpen()) close();
    },
    { signal }
  );
}

function initNavbar() {
  const navbar = document.querySelector('[data-navbar]');
  if (!navbar) return;

  navbarController?.abort();
  navbarController = new AbortController();
  const { signal } = navbarController;

  const threshold = parseFloat(navbar.dataset.threshold ?? '15');
  const time = parseFloat(navbar.dataset.time ?? '0.45');
  const deadZone = parseFloat(navbar.dataset.deadZone ?? '4');

  let isHidden = false;
  let onDark = false;
  let lastY = 0;

  gsap.set(navbar, { yPercent: 0 });

  const show = () => {
    if (!isHidden) return;
    isHidden = false;
    gsap.to(navbar, { yPercent: 0, duration: time, ease: 'power3.out', overwrite: true });
  };

  const hide = () => {
    if (isHidden) return;
    isHidden = true;
    gsap.to(navbar, { yPercent: -100, duration: time, ease: 'power3.in', overwrite: true });
  };

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();

      if (y < (threshold * window.innerHeight) / 100) {
        lastY = y;
        show();
        return;
      }

      if (Math.abs(y - lastY) < deadZone) return;
      lastY = y;

      if (onDark) {
        hide();
        return;
      }

      if (self.direction === -1) show();
      else hide();
    },
  });

  let darkCount = 0;
  gsap.utils
    .toArray(document.querySelectorAll('[data-footer-transition], [data-dark-bg]'))
    .forEach((scene) => {
      ScrollTrigger.create({
        trigger: scene,
        start: scene.dataset.start ?? 'top top',
        end: scene.dataset.end ?? 'bottom bottom',
        onToggle: (self) => {
          darkCount = Math.max(0, darkCount + (self.isActive ? 1 : -1));
          onDark = darkCount > 0;
          if (onDark) hide();
        },
      });
    });

  navbar.addEventListener('focusin', show, { signal });
}

function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const button = document.querySelector('[data-menu-open]');
  if (!menu || !button) return;

  menuController?.abort();
  menuController = new AbortController();
  const { signal } = menuController;

  const mask = { coverage: 100 };
  const drawMask = () => {
    menu.style.clipPath = `inset(0% 0% ${mask.coverage}% 0%)`;
  };

  const lines = gsap.utils.toArray(menu.querySelectorAll('[data-menu-line]'));

  mask.coverage = 100;
  drawMask();
  gsap.set(lines, { yPercent: 110 });

  const openTimeline = gsap
    .timeline({ paused: true })
    .to(mask, { coverage: 0, duration: 0.6, ease: 'power4.inOut', onUpdate: drawMask }, 0)
    .to(lines, { yPercent: 0, duration: 0.65, stagger: 0.05, ease: 'power3.out' }, 0.22);

  const RELEASE_CURTAIN = 0.2;
  const Z_ABOVE_CURTAIN = '75';
  let closeTimeline = null;
  const collapse = (aboveCurtain = false) => {
    let done;
    const wait = new Promise((resolve) => (done = resolve));
    if (aboveCurtain) menu.style.zIndex = Z_ABOVE_CURTAIN;
    const timeline = gsap
      .timeline({ onComplete: done })
      .to(lines, { yPercent: 110, duration: 0.45, stagger: 0.03, ease: 'power2.in' }, 0)
      .to(mask, { coverage: 100, duration: 0.8, ease: 'power2.inOut', onUpdate: drawMask }, 0.05)
      .add(done, RELEASE_CURTAIN);
    return { timeline, wait };
  };

  const isOpen = () => !menu.hasAttribute('inert');

  const open = () => {
    if (isOpen()) return;
    menu.removeAttribute('inert');
    button.setAttribute('aria-expanded', 'true');
    lenis?.stop();
    closeTimeline?.kill();
    menuCollapse = null;
    menu.style.zIndex = '';
    openTimeline.invalidate().play(0);
  };

  const close = (instant = false, aboveCurtain = false) => {
    if (!isOpen()) return;
    menu.setAttribute('inert', '');
    button.setAttribute('aria-expanded', 'false');
    lenis?.start();
    openTimeline.pause();
    closeTimeline?.kill();

    if (instant) {
      menuCollapse = null;
      menu.style.zIndex = '';
      mask.coverage = 100;
      drawMask();
      gsap.set(lines, { yPercent: 110 });
      return;
    }

    const { timeline, wait } = collapse(aboveCurtain);
    closeTimeline = timeline;
    menuCollapse = wait;
  };

  button.addEventListener('click', open, { signal });

  menu.querySelectorAll('[data-menu-close]').forEach((el) => {
    el.addEventListener('click', () => close(), { signal });
  });

  menu.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener(
      'click',
      () => {
        const href = link.getAttribute('href');
        const nowhere = !href || href === '#';
        if (nowhere && !link.hasAttribute('data-open-form')) return;

        close(false, !nowhere);
      },
      { signal }
    );
  });

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && isOpen()) close();
    },
    { signal }
  );

}

function initChatWidget() {
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

const SAFE_EDGE = 1;

function initParallax() {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const holder = el.parentElement;
    if (!holder) return;

    const travel = () =>
      Math.max(0, (el.offsetHeight - holder.clientHeight) / 2 - SAFE_EDGE);

    gsap.fromTo(
      el,
      { y: () => -travel() },
      {
        y: () => travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: holder,
          start: el.dataset.start ?? 'top bottom',
          end: el.dataset.end ?? 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });
}

const CURTAIN_TIME = 0.85;
const DARK_DELAY = 0.24;

const GREEN_EASE = 'power2.inOut';
const DARK_EASE = 'power3.inOut';

const ANIMATION_LEAD = 0.7;

function transitionCurtains() {
  const layer = document.querySelector('[data-transition]');
  if (!layer) return null;

  const pick = (selector) => gsap.utils.toArray(layer.querySelectorAll(selector));
  const green = pick('[data-transition-layer="green"] [data-transition-half]');
  const dark = pick('[data-transition-layer="dark"] [data-transition-half]');
  if (!green.length || !dark.length) return null;

  return {
    green,
    dark,
    leftHalves: pick('[data-transition-half="left"]'),
    rightHalves: pick('[data-transition-half="right"]'),
  };
}

async function coverScreen() {
  if (menuCollapse) {
    const wait = menuCollapse;
    menuCollapse = null;
    await Promise.race([wait, new Promise((r) => setTimeout(r, 1200))]);
  }

  const k = transitionCurtains();
  if (!k) return;

  curtainOpen = false;

  return new Promise((done) => {
    gsap
      .timeline({ onComplete: done })
      .set(k.leftHalves, { transformOrigin: 'left center', scaleX: 0 })
      .set(k.rightHalves, { transformOrigin: 'right center', scaleX: 0 })
      .to(k.green, { scaleX: 1, duration: CURTAIN_TIME, ease: GREEN_EASE }, 0)
      .to(k.dark, { scaleX: 1, duration: CURTAIN_TIME, ease: DARK_EASE }, DARK_DELAY);
  });
}

function uncoverScreen() {
  const k = transitionCurtains();
  if (!k) return openCurtainGate();

  const openEnd = DARK_DELAY + CURTAIN_TIME;
  const animationStart = Math.max(0, openEnd - ANIMATION_LEAD);

  gsap
    .timeline({ onComplete: openCurtainGate })
    .set(k.leftHalves, { transformOrigin: 'left center' })
    .set(k.rightHalves, { transformOrigin: 'right center' })
    .to(k.dark, { scaleX: 0, duration: CURTAIN_TIME, ease: DARK_EASE }, 0)
    .to(k.green, { scaleX: 0, duration: CURTAIN_TIME, ease: GREEN_EASE }, DARK_DELAY)
    .call(openCurtainGate, null, animationStart);
}

const LOADER_TIME = 3.6;
const SLOWDOWN_THRESHOLD = 87;
const RAMP_SHARE = 0.62;
const NUMBER_EXIT = 0.5;
const BAR_COLLAPSE = 0.55;

let firstVisit = true;

let loadingScreenActive = false;

function playLoadingScreen(screen) {
  const readNumber = screen.querySelector('[data-loader-number]');
  const bar = screen.querySelector('[data-loader-bar]');
  const left = gsap.utils.toArray(screen.querySelectorAll('[data-loader-half="left"]'));
  const right = gsap.utils.toArray(screen.querySelectorAll('[data-loader-half="right"]'));
  const halves = [...left, ...right];

  window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true, force: true });

  lenis?.stop();
  loadingScreenActive = true;

  const recalc = () => {
    ScrollTrigger.refresh();
    holdUnderCurtain();
  };

  const unlock = () => {
    if (!loadingScreenActive) return;
    loadingScreenActive = false;
    lenis?.start();
  };

  const state = { progress: 0 };
  const write = () => {
    if (readNumber) readNumber.textContent = String(Math.round(state.progress));
    if (bar) gsap.set(bar, { scaleX: state.progress / 100 });
  };

  gsap
    .timeline({
      onComplete: () => {
        unlock();
        screen.remove();
      },
    })
    .set(left, { transformOrigin: 'left center' })
    .set(right, { transformOrigin: 'right center' })
    .to(state, {
      progress: SLOWDOWN_THRESHOLD,
      duration: LOADER_TIME * RAMP_SHARE,
      ease: 'none',
      onUpdate: write,
    })
    .to(state, {
      progress: 100,
      duration: LOADER_TIME * (1 - RAMP_SHARE),
      ease: 'power2.out',
      onUpdate: write,
    })
    .call(recalc)
    .to(readNumber, { yPercent: 130, duration: NUMBER_EXIT, ease: 'power3.in' })
    .set(bar, { transformOrigin: 'right center' }, '<')
    .to(bar, { scaleX: 0, duration: BAR_COLLAPSE, ease: 'power2.inOut' }, '<+=0.12')
    .to(halves, { scaleX: 0, duration: CURTAIN_TIME, ease: DARK_EASE }, '>-0.15')
    .call(unlock, null, '<')
    .call(uncoverScreen, null, `-=${CURTAIN_TIME - DARK_DELAY}`);
}

const LAYOUT_THRESHOLD = '(width >= 64rem)'; // `lg` z Tailwinda; ten sam próg co warianty `max-lg:`
const REBUILD_KEY = 'layout-rebuild';

const savePosition = () => {
  try {
    sessionStorage.setItem(REBUILD_KEY, String(Math.round(window.scrollY)));
  } catch {
  }
};

const readPosition = () => {
  try {
    const value = sessionStorage.getItem(REBUILD_KEY);
    if (value !== null) sessionStorage.removeItem(REBUILD_KEY);
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
};

window.matchMedia(LAYOUT_THRESHOLD).addEventListener('change', () => {
  savePosition();
  location.reload();
});

function onPageEnter() {
  const positionAfterRebuild = readPosition();
  const afterRebuild = positionAfterRebuild !== null;

  const screen = firstVisit && !afterRebuild ? document.querySelector('[data-loader]') : null;
  firstVisit = false;

  if (!screen) {
    document.querySelector('[data-loader]')?.remove();

    if (afterRebuild) {
      window.scrollTo(0, positionAfterRebuild);
      lenis?.scrollTo(positionAfterRebuild, { immediate: true, force: true });
      ScrollTrigger.refresh();
    }

    uncoverScreen();
    return;
  }

  playLoadingScreen(screen);
}

function cleanup() {
  ScrollTrigger.getAll().forEach((t) => t.kill());

  afterCurtainOpen = [];
  if (faqController) {
    faqController.abort();
    faqController = null;
  }
  if (formController) {
    formController.abort();
    formController = null;
  }
  if (pageFormController) {
    pageFormController.abort();
    pageFormController = null;
  }
  if (navbarController) {
    navbarController.abort();
    navbarController = null;
  }
  if (cursorController) {
    cursorController.abort();
    cursorController = null;
  }
  if (selectController) {
    selectController.abort();
    selectController = null;
  }
  if (menuController) {
    menuController.abort();
    menuController = null;
  }
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

const INITS = [
  ['lenis', initLenis],
  ['animations', initAnimations],
  ['line-reveal', initLineReveal],
  ['word-scrub', initWordScrub],
  ['counters', initCounters],
  ['image-reveal', initImageReveal],
  ['image-grow', initImageGrow],
  ['dark-background', initDarkBackground],
  ['progress-bar', initProgressBar],
  ['scroll-bar', initScrollBar],
  ['logo-wall', initLogoWall],
  ['cards', initCards],
  ['horizontal', initHorizontal],
  ['rope', initRope],
  ['active-list', initActiveList],
  ['faq', initFaq],
  ['headline-pin', initHeadlinePin],
  ['footer-transition', initFooterTransition],
  ['form-panel', initContactForm],
  ['page-form', initPageForm],
  ['photo-tone', initPhotoTone],
  ['hover-cursor', initHoverCursor],
  ['custom-select', initCustomSelect],
  ['navbar', initNavbar],
  ['menu', initMenu],
  ['chat', initChatWidget],
  ['parallax', initParallax],
];

function setup() {
  cleanup();

  INITS.forEach(([name, init]) => {
    try {
      init();
    } catch (e) {
      console.error(`[animacje] błąd inicjalizacji: ${name}`, e);
    }
  });

  ScrollTrigger.refresh();

  holdUnderCurtain();

  document.fonts?.ready.then(() => {
    if (loadingScreenActive) return;
    ScrollTrigger.refresh();
    holdUnderCurtain();
  });
}

document.addEventListener('astro:page-load', setup);

document.addEventListener('astro:before-swap', cleanup);

document.addEventListener('astro:before-preparation', (event) => {
  const fetchPage = event.loader;
  event.loader = async () => {
    await coverScreen();
    await fetchPage();
  };
});

document.addEventListener('astro:page-load', onPageEnter);

document.addEventListener('astro:after-swap', () => {
  document.querySelector('[data-loader]')?.remove();
});

if (document.readyState !== 'loading') {
  setup();
} else {
  document.addEventListener('DOMContentLoaded', setup, { once: true });
}
