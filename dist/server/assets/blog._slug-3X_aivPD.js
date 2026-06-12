import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { f as blogPostQuery } from "./catalog-Cy6bWRG4.js";
import { b as Route } from "./router-x3seCsFL.js";
import "react";
import "lucide-react";
import "sonner";
import "./client-BC8ib9gb.js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
function BlogPost() {
  const {
    slug
  } = Route.useParams();
  const {
    data: post,
    isLoading
  } = useQuery(blogPostQuery(slug));
  if (isLoading) return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsx("p", { className: "py-32 text-center text-muted-warm", children: "Loading…" }) });
  if (!post) {
    return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "py-32 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-3xl", children: "Article not found" }),
      /* @__PURE__ */ jsx(Link, { to: "/blog", className: "mt-4 inline-block underline", children: "Back to journal" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-[760px] px-6 py-12 md:py-20", children: [
    /* @__PURE__ */ jsx(Link, { to: "/blog", className: "text-xs uppercase tracking-widest text-muted-warm hover:text-ink", children: "← Journal" }),
    post.category && /* @__PURE__ */ jsx("p", { className: "mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-warm", children: post.category }),
    /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-4xl font-medium leading-tight md:text-5xl", children: post.title }),
    /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-muted-warm", children: [
      "By ",
      post.author ?? "EL STYLE HOUSE"
    ] }),
    post.cover_url && /* @__PURE__ */ jsx("img", { src: post.cover_url, alt: post.title, className: "mt-8 w-full rounded-[12px] object-cover" }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 whitespace-pre-line text-pretty leading-relaxed text-ink/90", children: post.body })
  ] }) });
}
export {
  BlogPost as component
};
