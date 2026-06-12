import { Reveal } from "@/components/Reveal";
import embroidery from "@/assets/work-embroidery.jpg";
import coat from "@/assets/work-coat.jpg";
import gown from "@/assets/work-gown.jpg";
import suit from "@/assets/work-suit.jpg";

export function Works() {
  return (
    <section id="works" className="bg-canvas px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <Reveal className="mb-16 flex flex-col items-baseline justify-between gap-4 md:mb-20 md:flex-row">
          <h2 className="max-w-[15ch] text-balance font-serif text-4xl font-medium">Selected Works</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-warm">Editorial / Vol. 12</span>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-12">
          <Reveal className="space-y-6 md:col-span-7">
            <figure className="group overflow-hidden rounded-[12px]">
              <img
                src={embroidery}
                alt="Extreme close up of gold embroidery on charcoal wool"
                width={1216}
                height={1600}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
            </figure>
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-xl">Obsidian Sculptural Piece</h3>
              <span className="text-xs text-muted-warm">2024</span>
            </div>
          </Reveal>

          <Reveal delay={150} className="flex flex-col justify-center gap-12 md:col-span-5 md:pt-24">
            <div className="space-y-6">
              <figure className="group overflow-hidden rounded-[12px]">
                <img
                  src={coat}
                  alt="Model wearing a beige structured tailored coat"
                  width={800}
                  height={1216}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
              </figure>
              <p className="max-w-[35ch] text-pretty text-sm text-muted-warm">
                An exploration of negative space within traditional outerwear silhouettes.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-12 md:gap-12">
          <Reveal className="space-y-6 md:col-span-5">
            <figure className="group overflow-hidden rounded-[12px]">
              <img
                src={gown}
                alt="Model in a flowing ivory silk evening gown in a stone interior"
                width={992}
                height={1216}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
            </figure>
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-xl">Ethereal Column Gown</h3>
              <span className="text-xs text-muted-warm">2024</span>
            </div>
          </Reveal>

          <Reveal delay={150} className="space-y-6 md:col-span-7">
            <figure className="group overflow-hidden rounded-[12px]">
              <img
                src={suit}
                alt="Model in a sharply tailored black suit against brutalist concrete"
                width={1216}
                height={800}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
            </figure>
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-xl">Urban Structure Tailoring</h3>
              <span className="text-xs text-muted-warm">2024</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}