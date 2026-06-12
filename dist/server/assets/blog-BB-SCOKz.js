import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { b as blogQuery } from "./catalog-Cy6bWRG4.js";
import "./router-x3seCsFL.js";
import "./client-BC8ib9gb.js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
import "sonner";
function Blog() {
  const {
    data: posts = []
  } = useQuery(blogQuery());
  const [q, setQ] = useState("");
  const filtered = posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || (p.excerpt ?? "").toLowerCase().includes(q.toLowerCase()));
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-16", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-10 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-5xl font-medium md:text-6xl", children: "The Journal" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-warm", children: "Style guides, fashion tips and stories from the house." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto mb-12 w-full max-w-md", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-warm" }),
      /* @__PURE__ */ jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search the journal…", className: "w-full rounded-full border border-ink/15 bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ink" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3", children: filtered.map((p) => /* @__PURE__ */ jsxs(Link, { to: "/blog/$slug", params: {
      slug: p.slug
    }, className: "group block", children: [
      /* @__PURE__ */ jsx("figure", { className: "overflow-hidden rounded-[10px] bg-secondary", children: p.cover_url && /* @__PURE__ */ jsx("img", { src: p.cover_url, alt: p.title, loading: "lazy", className: "aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105" }) }),
      p.category && /* @__PURE__ */ jsx("p", { className: "mt-4 text-[11px] uppercase tracking-[0.3em] text-muted-warm", children: p.category }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-2xl leading-tight", children: p.title }),
      p.excerpt && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-warm line-clamp-2", children: p.excerpt })
    ] }, p.id)) }),
    filtered.length === 0 && /* @__PURE__ */ jsx("p", { className: "py-16 text-center text-muted-warm", children: "No articles found." })
  ] }) });
}
export {
  Blog as component
};
