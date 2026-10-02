import { useEffect, useRef, useState } from 'react';

// Fades an element in once, the first time it scrolls into view.
export function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (!('IntersectionObserver' in window)) return setShown(true);
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return [ref, shown];
}
