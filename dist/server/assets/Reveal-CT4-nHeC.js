import { jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const Tag = as;
  return /* @__PURE__ */ jsx(
    Tag,
    {
      ref,
      className: `${visible ? "reveal-visible" : "reveal-hidden"} ${className}`,
      style: { animationDelay: `${delay}ms` },
      children
    }
  );
}
export {
  Reveal as R
};
