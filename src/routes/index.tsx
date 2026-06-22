import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { Testimonials } from "@/components/sections/Testimonials";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { collectionsQuery, primaryImage, productsQuery } from "@/lib/catalog";
import { shopCollectionPresets } from "@/lib/navigation";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EL STYLE HOUSE — Luxury Fashion & Couture" },
      {
        name: "description",
        content:
          "EL STYLE HOUSE crafts luxury bridal, lace, event and aso-ebi couture. Shop the collection or request a bespoke custom order.",
      },
      { property: "og:title", content: "EL STYLE HOUSE — Luxury Fashion & Couture" },
      {
        property: "og:description",
        content: "Luxury bridal, lace, event and aso-ebi couture. Shop or request a custom order.",
      },
      { property: "og:image", content: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

const why = [
  { title: "Handcrafted", body: "Every piece is cut, fitted and finished by hand in our atelier." },
  { title: "Bespoke Fit", body: "Made-to-measure tailoring shaped to your exact silhouette." },
  { title: "Premium Fabric", body: "Sourced lace, silk and aso-oke chosen for drape and longevity." },
  { title: "Trusted Delivery", body: "Carefully packaged and delivered nationwide with care." },
];

function Index() {
  const { data: featured = [] } = useQuery(productsQuery({}));
  const { data: collections = [] } = useQuery(collectionsQuery());
  const bestSellers = featured.filter((p) => p.is_best_seller).slice(0, 4);
  const newArrivals = featured.filter((p) => p.is_new_arrival).slice(0, 4);
  const collectionBySlug = new Map(collections.map((collection) => [collection.slug, collection]));
  const oldestProducts = [...featured].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const featuredCollectionCards = shopCollectionPresets
    .map((collection) => {
      const savedCollection = collectionBySlug.get(collection.slug);
      const firstProduct = oldestProducts.find(
        (product) =>
          product.collections?.slug === collection.slug ||
          product.categories?.slug === collection.slug,
      );
      const image = firstProduct ? primaryImage(firstProduct) : savedCollection?.image_url;
      return image ? { ...collection, image } : null;
    })
    .filter(
      (collection): collection is (typeof shopCollectionPresets)[number] & { image: string } =>
        Boolean(collection),
    );

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative flex h-[88vh] min-h-[560px] w-full items-end overflow-hidden px-6 pb-16 md:px-12 md:pb-24">
        <img src={heroImg} alt="EL STYLE HOUSE couture" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/30" />
        <div className="relative z-10 w-full text-canvas">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-canvas/80">EL STYLE HOUSE</p>
          <h1 className="mb-6 max-w-[18ch] text-balance font-serif text-5xl font-medium leading-tight md:text-7xl">
            SHOP YOUR STYLE
          </h1>
          <p className="mb-8 max-w-[44ch] text-pretty text-base text-canvas/90">
            Bridal, lace, event and aso-ebi pieces designed to make every moment unforgettable.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/shop" className="rounded-full bg-canvas px-7 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03]">
              Shop the Collection
            </Link>
            <Link to="/custom-orders" className="rounded-full border border-canvas/60 px-7 py-3 text-sm font-medium text-canvas transition-colors hover:bg-canvas/10">
              Request Custom Order
            </Link>
          </div>
        </div>
      </section>

      {/* Featured collections */}
      {featuredCollectionCards.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-20 md:px-12 md:py-28">
          <Reveal className="mb-12 flex items-end justify-between">
            <h2 className="font-serif text-4xl font-medium md:text-5xl">Featured Collections</h2>
            <Link to="/collections" className="text-xs uppercase tracking-[0.3em] text-muted-warm hover:text-ink">
              View all
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCollectionCards.map((collection) => (
              <Link
                key={collection.slug}
                to="/shop"
                search={{ category: collection.category.slug, collection: collection.slug }}
                className="group relative overflow-hidden rounded-[10px]"
              >
                <img
                  src={collection.image}
                  alt={collection.label}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-canvas/75">
                    {collection.category.label}
                  </p>
                  <h3 className="font-serif text-2xl text-canvas">{collection.label}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="bg-secondary px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-[1600px]">
            <Reveal className="mb-12 flex items-end justify-between">
              <h2 className="font-serif text-4xl font-medium md:text-5xl">Best Sellers</h2>
              <Link to="/shop" className="text-xs uppercase tracking-[0.3em] text-muted-warm hover:text-ink">Shop all</Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 py-20 md:px-12 md:py-28">
          <Reveal className="mb-12 flex items-end justify-between">
            <h2 className="font-serif text-4xl font-medium md:text-5xl">New Arrivals</h2>
            <Link to="/shop" className="text-xs uppercase tracking-[0.3em] text-muted-warm hover:text-ink">Shop all</Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="bg-ink px-6 py-20 text-canvas md:px-12 md:py-28">
        <div className="mx-auto max-w-[1600px]">
          <Reveal>
            <h2 className="mb-12 font-serif text-4xl font-medium md:text-5xl">Why Choose Us</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w, i) => (
              <Reveal key={w.title} delay={i * 100}>
                <div className="border-t border-canvas/15 pt-6">
                  <h3 className="mb-3 font-serif text-2xl">{w.title}</h3>
                  <p className="text-sm text-canvas/70">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <NewsletterSignup />
    </SiteShell>
  );
}
