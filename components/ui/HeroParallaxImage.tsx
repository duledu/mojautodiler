'use client';

import { useEffect, useRef } from 'react';

export default function HeroParallaxImage() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imageLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const imageLayer = imageLayerRef.current;
    if (!wrapper || !imageLayer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileViewport = window.matchMedia('(max-width: 767px)');
    let frame = 0;

    const update = () => {
      frame = 0;

      if (reducedMotion.matches || mobileViewport.matches) {
        imageLayer.style.transform = 'translate3d(0, 0, 0) scale(1.04)';
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const viewportProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const centeredProgress = viewportProgress - 0.5;
      const offset = Math.max(-30, Math.min(30, centeredProgress * -44));
      imageLayer.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    reducedMotion.addEventListener('change', requestUpdate);
    mobileViewport.addEventListener('change', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      reducedMotion.removeEventListener('change', requestUpdate);
      mobileViewport.removeEventListener('change', requestUpdate);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={imageLayerRef}
        className="absolute -inset-y-10 inset-x-0 bg-cover bg-center opacity-[0.24] will-change-transform"
        style={{ backgroundImage: "url('/mojautodiler_front.jpg')" }}
        aria-hidden="true"
      />
    </div>
  );
}
