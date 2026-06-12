import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { P as ProductCard } from "./ProductCard-BeeKo7U2.js";
import { c as collectionsQuery, p as productsQuery } from "./catalog-Cy6bWRG4.js";
import { a as Route } from "./router-x3seCsFL.js";
import "react";
import "lucide-react";
import "sonner";
import "./format-DildIsQ0.js";
import "./client-BC8ib9gb.js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
function CollectionDetail() {
  const {
    slug
  } = Route.useParams();
  const {
    data: collections = []
  } = useQuery(collectionsQuery());
  const {
    data: products = []
  } = useQuery(productsQuery({
    collection: slug
  }));
  const collection = collections.find((c) => c.slug === slug);
  return /* @__PURE__ */ jsxs(SiteShell, { children: [
    /* @__PURE__ */ jsxs("section", { className: "relative flex h-[40vh] min-h-[320px] items-end overflow-hidden px-6 pb-12 md:px-12", children: [
      collection?.image_url && /* @__PURE__ */ jsx("img", { src: collection.image_url, alt: collection.name, className: "absolute inset-0 h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/20" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 text-canvas", children: [
        /* @__PURE__ */ jsx(Link, { to: "/collections", className: "text-xs uppercase tracking-widest text-canvas/80 hover:text-canvas", children: "← All Collections" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-5xl font-medium md:text-6xl", children: collection?.name ?? "Collection" }),
        collection?.description && /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-[50ch] text-canvas/85", children: collection.description })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16", children: products.length === 0 ? /* @__PURE__ */ jsx("p", { className: "py-16 text-center text-muted-warm", children: "Pieces from this collection are coming soon." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-4", children: products.map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p.id)) }) })
  ] });
}
export {
  CollectionDetail as component
};
