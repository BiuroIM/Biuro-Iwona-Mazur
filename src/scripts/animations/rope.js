import { gsap } from 'gsap';

export function initRope() {
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
