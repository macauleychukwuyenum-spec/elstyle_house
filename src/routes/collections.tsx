import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { collectionsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — EL STYLE HOUSE" },
      { name: "description", content: "Explore the Bridal, Luxury Lace, Event, Aso-Ebi and Signature collections by EL STYLE HOUSE." },
      { property: "og:title", content: "Collections — EL STYLE HOUSE" },
      { property: "og:description", content: "Bridal, lace, event, aso-ebi and signature couture collections." },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data: collections = [] } = useQuery(collectionsQuery());
  return (
    <SiteShell>
      <div className="mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-medium md:text-6xl">Our Collections</h1>
          <p className="mt-3 text-muted-warm">Curated lines for every celebration.</p>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 100}>
              <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block overflow-hidden rounded-[10px]">
                <figure className="relative overflow-hidden">
                  <img src={c.image_url ?? ""} alt={c.name} loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <figcaption className="absolute bottom-6 left-6 right-6">
                    <h2 className="font-serif text-3xl text-canvas">{c.name}</h2>
                    {c.description && <p className="mt-1 text-sm text-canvas/80 line-clamp-2">{c.description}</p>}
                  </figcaption>
                </figure>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}