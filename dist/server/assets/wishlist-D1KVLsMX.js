import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { s as supabase } from "./client-BC8ib9gb.js";
import { u as useAuth } from "./router-x3seCsFL.js";
import { f as formatNaira } from "./format-DildIsQ0.js";
import { e as primaryImage } from "./catalog-Cy6bWRG4.js";
import "react";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
function Wishlist() {
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const {
    data: items = []
  } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("wishlists").select("id, product_id, products(*, product_images(*), collections(name,slug))").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const remove = async (id) => {
    await supabase.from("wishlists").delete().eq("id", id);
    qc.invalidateQueries({
      queryKey: ["wishlist"]
    });
  };
  const moveToCart = async (row) => {
    if (!user) return;
    await supabase.from("cart_items").upsert({
      user_id: user.id,
      product_id: row.product_id,
      quantity: 1,
      size: "M",
      color: "As shown"
    }, {
      onConflict: "user_id,product_id,size,color"
    });
    await supabase.from("wishlists").delete().eq("id", row.id);
    qc.invalidateQueries({
      queryKey: ["wishlist"]
    });
    qc.invalidateQueries({
      queryKey: ["cart"]
    });
    toast.success("Moved to cart.");
  };
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1100px] px-6 py-12 md:py-16", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-10 font-serif text-5xl font-medium", children: "My Wishlist" }),
    items.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "py-16 text-center text-muted-warm", children: [
      "Your wishlist is empty. ",
      /* @__PURE__ */ jsx(Link, { to: "/shop", className: "underline", children: "Browse the shop" }),
      "."
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: items.map((row) => /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-[10px] border border-ink/10", children: [
      /* @__PURE__ */ jsx(Link, { to: "/product/$slug", params: {
        slug: row.products.slug
      }, children: /* @__PURE__ */ jsx("img", { src: primaryImage(row.products), alt: row.products.name, className: "aspect-[4/5] w-full object-cover" }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg", children: row.products.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-warm", children: formatNaira(row.products.price) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => moveToCart(row), className: "flex-1 rounded-full bg-ink py-2 text-xs font-bold uppercase tracking-widest text-canvas", children: "Move to Cart" }),
          /* @__PURE__ */ jsx("button", { onClick: () => remove(row.id), "aria-label": "Remove", className: "grid size-9 place-items-center rounded-full border border-ink/15 hover:bg-secondary", children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) })
        ] })
      ] })
    ] }, row.id)) })
  ] }) });
}
export {
  Wishlist as component
};
