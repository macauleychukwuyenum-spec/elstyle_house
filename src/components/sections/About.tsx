import { Reveal } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import maker from "@/assets/maker.jpg";

const stats = [
  { value: 12, label: "Years in Craft" },
  { value: 24, label: "Collections" },
  { value: 8, label: "Ateliers" },
];

export function About() {
  return (
    <section id="about" className="bg-ink py-24 text-canvas md:py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:gap-20 md:px-12">
        <Reveal className="order-2 md:order-1">
          <h2 className="mb-8 font-serif text-4xl font-medium leading-tight md:text-5xl">
            Rooted in the Heritage <br className="hidden md:block" /> of Haute Couture
          </h2>
          <p className="mb-12 max-w-[56ch] text-pretty text-base leading-relaxed text-canvas/80">
            Founded in 2012, {""}
            AETERNA stands as a beacon for those who find beauty in the subtle. We believe that true
            luxury isn't heard; it is felt in the drape of a sleeve and the strength of a seam — each
            piece cut, fitted and finished entirely by hand.
          </p>

          <div className="grid grid-cols-3 gap-8 border-t border-canvas/10 pt-12">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="mb-1 font-serif text-3xl md:text-4xl">
                  <Counter value={s.value} />
                </div>
                <div className="text-[10px] uppercase tracking-widest opacity-60">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150} className="order-1 md:order-2">
          <figure className="overflow-hidden rounded-[12px]">
            <img
              src={maker}
              alt="A tailor's hands working with fine linen on a couture garment"
              width={992}
              height={1216}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}