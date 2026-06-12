import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { e as primaryImage } from "./catalog-Cy6bWRG4.js";
import { f as formatNaira } from "./format-DildIsQ0.js";
function ProductCard({ product }) {
  const img = primaryImage(product);
  return /* @__PURE__ */ jsxs(Link, { to: "/product/$slug", params: { slug: product.slug }, className: "group block", children: [
    /* @__PURE__ */ jsxs("figure", { className: "relative overflow-hidden rounded-[10px] bg-secondary", children: [
      img ? /* @__PURE__ */ jsx(
        "img",
        {
          src: img,
          alt: product.name,
          loading: "lazy",
          className: "aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "aspect-[4/5] w-full" }),
      product.is_new_arrival && /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[10px] uppercase tracking-widest text-canvas", children: "New" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg leading-tight", children: product.name }),
        product.collections?.name && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-warm", children: product.collections.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: formatNaira(product.price) }),
        product.compare_at_price && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-warm line-through", children: formatNaira(product.compare_at_price) })
      ] })
    ] })
  ] });
}
export {
  ProductCard as P
};
