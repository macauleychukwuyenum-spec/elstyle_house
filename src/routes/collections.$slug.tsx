import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { collectionsQuery, productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} Collection — EL STYLE HOUSE` },
      { name: "description", content: "Explore this collection from EL STYLE HOUSE." },
    ],
  }),
  component: CollectionDetail,
});

function CollectionDetail() {
  const { slug } = Route.useParams();
  const { data: collections = [] } = useQuery(collectionsQuery());
  const { data: products = [] } = useQuery(productsQuery({ collection: slug }));
  const collection = collections.find((c) => c.slug === slug);

  return (
    <SiteShell>
      <section className="relative flex h-[40vh] min-h-[320px] items-end overflow-hidden px-6 pb-12 md:px-12">
        {collection?.image_url && <img src={collection.image_url} alt={collection.name} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/20" />
        <div className="relative z-10 text-canvas">
          <Link to="/collections" className="text-xs uppercase tracking-widest text-canvas/80 hover:text-canvas">← All Collections</Link>
          <h1 className="mt-3 font-serif text-5xl font-medium md:text-6xl">{collection?.name ?? "Collection"}</h1>
          {collection?.description && <p className="mt-2 max-w-[50ch] text-canvas/85">{collection.description}</p>}
        </div>
      </section>
      <div className="mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16">
        {products.length === 0 ? (
          <p className="py-16 text-center text-muted-warm">Pieces from this collection are coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </SiteShell>
  );
}