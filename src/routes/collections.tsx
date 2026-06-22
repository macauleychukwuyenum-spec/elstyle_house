import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { collectionsQuery, primaryImage, productsQuery } from "@/lib/catalog";
import {
  fabricsCategory,
  shopCategories,
  shopCollectionPresets,
  shopMenuSections,
} from "@/lib/navigation";

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
  const { data: products = [] } = useQuery(productsQuery({}));
  const [activeCategory, setActiveCategory] = useState("");
  const collectionBySlug = new Map(collections.map((collection) => [collection.slug, collection]));
  const oldestProducts = [...products].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const selectedSection = shopMenuSections.find(
    (section) => section.category.slug === activeCategory,
  );
  const visibleCollections = activeCategory
    ? selectedSection?.items.map((item) => ({
        ...item,
        category: selectedSection.category,
      })) ?? []
    : shopCollectionPresets;

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-medium md:text-6xl">Our Collections</h1>
          <p className="mt-3 text-muted-warm">Curated lines for every celebration.</p>
        </header>
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory("")}
            className={`min-h-11 rounded-full border px-5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              activeCategory === ""
                ? "border-ink bg-ink text-canvas"
                : "border-ink/15 hover:bg-secondary"
            }`}
          >
            View All
          </button>
          {shopCategories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.slug)}
              className={`min-h-11 rounded-full border px-5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                activeCategory === category.slug
                  ? "border-ink bg-ink text-canvas"
                  : "border-ink/15 hover:bg-secondary"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {activeCategory === fabricsCategory.slug ? (
          <p className="py-16 text-center text-muted-warm">Fabric collections are coming soon.</p>
        ) : visibleCollections.length === 0 ? (
          <p className="py-16 text-center text-muted-warm">Collections are coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCollections.map((collection, i) => {
              const savedCollection = collectionBySlug.get(collection.slug);
              const firstProduct = oldestProducts.find(
                (product) =>
                  product.collections?.slug === collection.slug ||
                  product.categories?.slug === collection.slug,
              );
              const image = savedCollection?.image_url ?? (firstProduct ? primaryImage(firstProduct) : undefined);
              return (
                <Reveal key={collection.slug} delay={(i % 3) * 100}>
                  <Link
                    to="/shop"
                    search={{ category: collection.category.slug, collection: collection.slug }}
                    className="group block overflow-hidden rounded-[10px]"
                  >
                    <figure className="relative overflow-hidden bg-secondary">
                      {image ? (
                        <img
                          src={image}
                          alt={collection.label}
                          loading="lazy"
                          className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="aspect-[3/4] w-full" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-ink/10" />
                      <figcaption className="absolute bottom-6 left-6 right-6">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-canvas/75">
                          {collection.category.label}
                        </p>
                        <h2 className="font-serif text-3xl text-canvas">{collection.label}</h2>
                        {savedCollection?.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-canvas/80">
                            {savedCollection.description}
                          </p>
                        )}
                      </figcaption>
                    </figure>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
