'use client';

import {useEffect, useRef} from 'react';

/**
 * Scroll-linked hero depth: starts tilted back, settles upright as the user scrolls.
 * Transform + opacity only; lerped for interruptible scroll direction changes.
 */
export function HeroFrameTilt({children}: {children: React.ReactNode}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const tiltEl = tiltRef.current;
    if (!wrap || !tiltEl) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = window.matchMedia('(max-width: 900px)');

    const state = {
      tilt: 12,
      scale: 0.97,
      targetTilt: 12,
      targetScale: 0.97,
      raf: 0,
    };

    const setStatic = () => {
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
      tiltEl.style.transform = narrow.matches ? 'none' : 'rotateX(8deg) scale(0.98)';
      tiltEl.style.willChange = 'auto';
    };

    if (reduceMotion.matches) {
      setStatic();
      const onChange = () => {
        if (reduceMotion.matches || narrow.matches) setStatic();
      };
      reduceMotion.addEventListener('change', onChange);
      narrow.addEventListener('change', onChange);
      return () => {
        reduceMotion.removeEventListener('change', onChange);
        narrow.removeEventListener('change', onChange);
      };
    }

    const updateTargets = () => {
      if (narrow.matches) {
        state.targetTilt = 0;
        state.targetScale = 1;
        return;
      }

      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 near page top (frame lower in view) → 1 as the frame rises toward the top
      const raw = (vh * 0.62 - rect.top) / (vh * 0.55 + rect.height * 0.2);
      const progress = Math.min(1, Math.max(0, raw));
      const eased = 1 - (1 - progress) * (1 - progress); // ease-out quad
      state.targetTilt = 14 * (1 - eased);
      state.targetScale = 0.96 + 0.04 * eased;
    };

    const tick = () => {
      // Smooth follow so reversing scroll feels interruptible
      state.tilt += (state.targetTilt - state.tilt) * 0.14;
      state.scale += (state.targetScale - state.scale) * 0.14;
      tiltEl.style.transform = `rotateX(${state.tilt.toFixed(3)}deg) scale(${state.scale.toFixed(4)})`;

      const settled =
        Math.abs(state.targetTilt - state.tilt) < 0.02 &&
        Math.abs(state.targetScale - state.scale) < 0.0002;

      if (settled) {
        state.raf = 0;
        tiltEl.style.willChange = 'auto';
        return;
      }
      state.raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      updateTargets();
      tiltEl.style.willChange = 'transform';
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    };

    updateTargets();
    state.tilt = state.targetTilt;
    state.scale = state.targetScale;
    tiltEl.style.transform = `rotateX(${state.tilt.toFixed(3)}deg) scale(${state.scale.toFixed(4)})`;

    window.addEventListener('scroll', kick, {passive: true});
    window.addEventListener('resize', kick, {passive: true});
    narrow.addEventListener('change', kick);

    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      narrow.removeEventListener('change', kick);
      if (state.raf) cancelAnimationFrame(state.raf);
      tiltEl.style.willChange = 'auto';
    };
  }, []);

  return (
    <div className="ms-hero-frame-wrap" ref={wrapRef}>
      <div className="ms-hero-frame-tilt" ref={tiltRef}>
        {children}
      </div>
    </div>
  );
}
