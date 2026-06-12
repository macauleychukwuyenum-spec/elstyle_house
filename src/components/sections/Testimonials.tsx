import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const quotes = [
  {
    text: "The attention to tactile detail is unmatched in the modern market. Wearing AETERNA feels like a quiet conversation with history.",
    author: "Elena Rossi, Vogue Italy",
  },
  {
    text: "A masterclass in restraint. Every piece feels essential, stripped of noise but rich in substance.",
    author: "Julian Vance, Creative Director",
  },
  {
    text: "They don't design clothes; they construct identities. The bespoke tailoring is simply without equal.",
    author: "Marguerite Laurent, Harper's Bazaar",
  },
];

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="testimonials" className="overflow-hidden bg-canvas px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-12 flex items-end justify-between">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-warm">Voices</span>
          <div className="flex gap-3">
            <button
              aria-label="Previous testimonial"
              onClick={() => scrollBy(-1)}
              className="grid size-11 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-canvas"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              aria-label="Next testimonial"
              onClick={() => scrollBy(1)}
              className="grid size-11 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-canvas"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </Reveal>

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-12 overflow-x-auto"
        >
          {quotes.map((q) => (
            <figure key={q.author} className="min-w-[300px] shrink-0 snap-center md:min-w-[640px]">
              <blockquote className="mb-8 text-pretty font-serif text-3xl italic leading-tight md:text-4xl">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="text-xs font-medium uppercase tracking-widest text-muted-warm">
                {q.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}