import React, { useEffect, useRef, useState } from 'react';

const DefaultDeferredFallback = ({ minHeight }) => (
  <div
    className="media-panel-soft flex items-center justify-center rounded-[32px] border border-white/10 p-6"
    style={{ minHeight }}
    aria-hidden
  >
    <div className="w-full max-w-3xl animate-pulse space-y-4">
      <div className="h-4 w-32 rounded-full bg-white/[0.08]" />
      <div className="h-10 w-3/4 rounded-full bg-white/[0.08]" />
      <div className="h-4 w-full rounded-full bg-white/[0.06]" />
      <div className="h-4 w-5/6 rounded-full bg-white/[0.06]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-[28px] bg-white/[0.05]" />
        <div className="h-48 rounded-[28px] bg-white/[0.05]" />
      </div>
    </div>
  </div>
);

const DeferredSection = ({
  children,
  fallback,
  forceRender = false,
  minHeight = 720,
  rootMargin = '420px 0px',
}) => {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(forceRender);

  useEffect(() => {
    if (forceRender) {
      setShouldRender(true);
      return undefined;
    }

    if (shouldRender || typeof window === 'undefined') {
      return undefined;
    }

    const node = containerRef.current;

    if (!node) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [forceRender, rootMargin, shouldRender]);

  return (
    <div ref={containerRef}>
      {shouldRender ? children : (fallback || <DefaultDeferredFallback minHeight={minHeight} />)}
    </div>
  );
};

export default DeferredSection;
