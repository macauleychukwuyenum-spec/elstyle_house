import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { R as Reveal } from "./Reveal-CT4-nHeC.js";
import { c as collectionsQuery } from "./catalog-Cy6bWRG4.js";
import "react";
import "lucide-react";
import "./router-x3seCsFL.js";
import "./client-BC8ib9gb.js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
import "sonner";
function CollectionsPage() {
  const {
    data: collections = []
  } = useQuery(collectionsQuery());
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-12 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-5xl font-medium md:text-6xl", children: "Our Collections" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-warm", children: "Curated lines for every celebration." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: collections.map((c, i) => /* @__PURE__ */ jsx(Reveal, { delay: i % 3 * 100, children: /* @__PURE__ */ jsx(Link, { to: "/collections/$slug", params: {
      slug: c.slug
    }, className: "group block overflow-hidden rounded-[10px]", children: /* @__PURE__ */ jsxs("figure", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("img", { src: c.image_url ?? "", alt: c.name, loading: "lazy", className: "aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" }),
      /* @__PURE__ */ jsxs("figcaption", { className: "absolute bottom-6 left-6 right-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-3xl text-canvas", children: c.name }),
        c.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-canvas/80 line-clamp-2", children: c.description })
      ] })
    ] }) }) }, c.id)) })
  ] }) });
}
export {
  CollectionsPage as component
};
