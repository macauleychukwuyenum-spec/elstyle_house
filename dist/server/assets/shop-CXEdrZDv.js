import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { P as ProductCard } from "./ProductCard-BeeKo7U2.js";
import { p as productsQuery, c as collectionsQuery, a as categoriesQuery } from "./catalog-Cy6bWRG4.js";
import "@tanstack/react-router";
import "./router-x3seCsFL.js";
import "./client-BC8ib9gb.js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
import "sonner";
import "./format-DildIsQ0.js";
const PAGE_SIZE = 8;
function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [collection, setCollection] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const {
    data: products = [],
    isLoading
  } = useQuery(productsQuery({
    search,
    category,
    collection,
    sort
  }));
  const {
    data: collections = []
  } = useQuery(collectionsQuery());
  const {
    data: categories = []
  } = useQuery(categoriesQuery());
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paged = useMemo(() => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [products, page]);
  const reset = (fn) => {
    fn();
    setPage(1);
  };
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-10 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-5xl font-medium md:text-6xl", children: "The Shop" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-warm", children: "Discover the full EL STYLE HOUSE collection." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-warm" }),
        /* @__PURE__ */ jsx("input", { value: search, onChange: (e) => reset(() => setSearch(e.target.value)), placeholder: "Search pieces…", className: "w-full rounded-full border border-ink/15 bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ink" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("select", { value: category, onChange: (e) => reset(() => setCategory(e.target.value)), className: "rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm outline-none", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Categories" }),
          categories.map((c) => /* @__PURE__ */ jsx("option", { value: c.slug, children: c.name }, c.id))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: collection, onChange: (e) => reset(() => setCollection(e.target.value)), className: "rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm outline-none", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Collections" }),
          collections.map((c) => /* @__PURE__ */ jsx("option", { value: c.slug, children: c.name }, c.id))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: sort, onChange: (e) => setSort(e.target.value), className: "rounded-full border border-ink/15 bg-card px-4 py-2.5 text-sm outline-none", children: [
          /* @__PURE__ */ jsx("option", { value: "newest", children: "Newest" }),
          /* @__PURE__ */ jsx("option", { value: "price-asc", children: "Price: Low to High" }),
          /* @__PURE__ */ jsx("option", { value: "price-desc", children: "Price: High to Low" })
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("p", { className: "py-20 text-center text-muted-warm", children: "Loading…" }) : paged.length === 0 ? /* @__PURE__ */ jsx("p", { className: "py-20 text-center text-muted-warm", children: "No pieces match your filters." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-4", children: paged.map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p.id)) }),
    pageCount > 1 && /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center gap-2", children: Array.from({
      length: pageCount
    }).map((_, i) => /* @__PURE__ */ jsx("button", { onClick: () => setPage(i + 1), className: `size-10 rounded-full text-sm transition-colors ${page === i + 1 ? "bg-ink text-canvas" : "border border-ink/15 hover:bg-secondary"}`, children: i + 1 }, i)) })
  ] }) });
}
export {
  ShopPage as component
};
