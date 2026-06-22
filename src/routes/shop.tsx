import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { productsQuery, collectionsQuery, categoriesQuery } from "@/lib/catalog";
import {
  fabricsCategory,
  isPresetShopCategory,
  shopMenuSections,
  sortShopCategories,
} from "@/lib/navigation";

type ShopSearch = {
  q?: string;
  category?: string;
  collection?: string;
  sort?: string;
};

function stringSearch(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: stringSearch(search.q),
    category: stringSearch(search.category),
    collection: stringSearch(search.collection),
    sort: stringSearch(search.sort),
  }),
  head: () => ({
    meta: [
      { title: "Shop — EL STYLE HOUSE" },
      { name: "description", content: "Browse luxury dresses, gowns, lace and aso-ebi pieces from EL STYLE HOUSE." },
      { property: "og:title", content: "Shop — EL STYLE HOUSE" },
      { property: "og:description", content: "Browse luxury couture pieces from EL STYLE HOUSE." },
    ],
  }),
  component: ShopPage,
});

const PAGE_SIZE = 8;

function ShopPage() {
  const routeSearch = Route.useSearch();
  const [search, setSearch] = useState(routeSearch.q ?? "");
  const [category, setCategory] = useState(routeSearch.category ?? "");
  const [collection, setCollection] = useState(routeSearch.collection ?? "");
  const [sort, setSort] = useState(routeSearch.sort ?? "newest");
  const [page, setPage] = useState(1);

  const { data: products = [], isLoading } = useQuery(
    productsQuery({ search, category, collection, sort }),
  );
  const { data: collections = [] } = useQuery(collectionsQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());
  const sortedCategories = useMemo(() => sortShopCategories(categories), [categories]);
  const customCategories = useMemo(
    () => sortedCategories.filter((c) => !isPresetShopCategory(c.slug)),
    [sortedCategories],
  );

  useEffect(() => {
    setSearch(routeSearch.q ?? "");
    setCategory(routeSearch.category ?? "");
    setCollection(routeSearch.collection ?? "");
    setSort(routeSearch.sort ?? "newest");
    setPage(1);
  }, [routeSearch.q, routeSearch.category, routeSearch.collection, routeSearch.sort]);

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paged = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [products, page],
  );

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-5xl font-medium md:text-6xl">The Shop</h1>
          <p className="mt-3 text-muted-warm">Discover the full EL STYLE HOUSE collection.</p>
        </header>

        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-warm" />
            <input
              value={search}
              onChange={(e) => reset(() => setSearch(e.target.value))}
              placeholder="Search pieces…"
              className="w-full rounded-full border border-ink/15 bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ink"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={category} onChange={(e) => reset(() => setCategory(e.target.value))} className="rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm outline-none">
              <option value="">All Categories</option>
              {shopMenuSections.map((section) => (
                <optgroup key={section.label} label={section.label}>
                  {section.items.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={fabricsCategory.slug}>{fabricsCategory.label}</option>
              {customCategories.length > 0 && (
                <optgroup label="Other">
                  {customCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <select value={collection} onChange={(e) => reset(() => setCollection(e.target.value))} className="rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm outline-none">
              <option value="">All Collections</option>
              {collections.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm outline-none">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="py-20 text-center text-muted-warm">Loading…</p>
        ) : paged.length === 0 ? (
          <p className="py-20 text-center text-muted-warm">No pieces match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {paged.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {pageCount > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`size-10 rounded-full text-sm transition-colors ${
                  page === i + 1 ? "bg-ink text-canvas" : "border border-ink/15 hover:bg-secondary"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
