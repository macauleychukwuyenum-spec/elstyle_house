import { useEffect, useRef, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { whatsappLink } from "@/lib/site";

export function Hero() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="relative flex h-screen w-full items-end overflow-hidden px-6 pb-24 md:px-12">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroImg}
          alt="High-end silk fabric draped over a sculptural chair in a sunlit Parisian studio"
          width={1920}
          height={1088}
          className="h-[120%] w-full object-cover"
          style={{ transform: `translateY(${offset}px)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/10 to-ink/20" />
      </div>

      <div className="relative z-10 w-full text-canvas">
        <h1 className="mb-8 max-w-[20ch] text-balance font-serif text-5xl font-medium leading-tight md:text-8xl reveal-visible">
          The Architecture <br /> of Silent Fabric
        </h1>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-[40ch] text-pretty text-base leading-relaxed text-canvas/90">
            Defining the modern silhouette through meticulous craft and archival reverence.
            The Autumn / Winter collection now debuting.
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 self-start rounded-full bg-ink py-3 pl-3 pr-4 text-sm font-medium text-canvas transition-all duration-500 hover:ring-2 hover:ring-canvas/40 md:self-auto"
          >
            <span className="size-2 shrink-0 rounded-full bg-canvas transition-transform duration-500 group-hover:scale-150" />
            Explore the Collection
          </a>
        </div>
      </div>
    </section>
  );
}