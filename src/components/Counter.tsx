import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  padStart?: boolean;
}

/** Animated count-up that triggers when scrolled into view. */
export function Counter({ value, suffix = "", duration = 1800, padStart = true }: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = padStart && value < 100 ? String(display).padStart(2, "0") : String(display);

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}