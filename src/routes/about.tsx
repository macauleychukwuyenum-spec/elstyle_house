import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import maker from "@/assets/maker.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — EL STYLE HOUSE" },
      { name: "description", content: "The story, mission and values behind EL STYLE HOUSE — a luxury fashion brand crafting couture by hand." },
      { property: "og:title", content: "About — EL STYLE HOUSE" },
      { property: "og:description", content: "The story and values behind EL STYLE HOUSE couture." },
    ],
  }),
  component: About,
});

const values = [
  { title: "Craft", body: "We honour traditional techniques, finishing every seam by hand." },
  { title: "Individuality", body: "Each woman is unique; her wardrobe should be too." },
  { title: "Excellence", body: "Only the finest fabrics and the highest standards make it to you." },
];

function About() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-20 md:px-12 md:py-24">
        <Reveal>
          <span className="text-[11px] uppercase tracking-[0.4em] text-muted-warm">Our Story</span>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-tight md:text-6xl">Designed to Be Remembered</h1>
          <p className="mt-6 max-w-[52ch] text-pretty leading-relaxed text-muted-warm">
            EL STYLE HOUSE was born from a love of elegant, intentional design. We create couture
            pieces for bridal, lace, event and aso-ebi moments — garments made to be felt, not just worn.
            Every piece is cut, fitted and finished by hand in our atelier.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <figure className="overflow-hidden rounded-[12px]">
            <img src={maker} alt="EL STYLE HOUSE atelier" className="aspect-[4/5] w-full object-cover" />
          </figure>
        </Reveal>
      </section>

      <section className="bg-ink px-6 py-20 text-canvas md:px-12 md:py-28">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className="mb-3 font-serif text-3xl">Our Mission</h2>
            <p className="text-canvas/75">To make every woman feel unmistakably herself — confident, celebrated and beautifully dressed for life's defining moments.</p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mb-3 font-serif text-3xl">Our Vision</h2>
            <p className="text-canvas/75">To become the most loved couture house for the modern African woman, blending heritage with contemporary elegance.</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28">
        <h2 className="mb-12 font-serif text-4xl font-medium md:text-5xl">Core Values</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <div className="border-t border-ink/15 pt-6">
                <h3 className="mb-3 font-serif text-2xl">{v.title}</h3>
                <p className="text-muted-warm">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/custom-orders" className="rounded-full bg-ink px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas">
            Work With Us
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}