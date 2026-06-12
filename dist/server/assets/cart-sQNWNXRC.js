import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { s as supabase } from "./client-BC8ib9gb.js";
import { u as useAuth } from "./router-x3seCsFL.js";
import { f as formatNaira } from "./format-DildIsQ0.js";
import { e as primaryImage } from "./catalog-Cy6bWRG4.js";
import "react";
import "sonner";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
const DELIVERY_FEE = 5e3;
function useCart() {
  const {
    user
  } = useAuth();
  return useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("cart_items").select("id, product_id, quantity, size, color, products(*, product_images(*))").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function Cart() {
  const qc = useQueryClient();
  const {
    data: items = []
  } = useCart();
  const subtotal = items.reduce((s, i) => s + Number(i.products.price) * i.quantity, 0);
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);
  const setQty = async (id, q) => {
    if (q < 1) return;
    await supabase.from("cart_items").update({
      quantity: q
    }).eq("id", id);
    qc.invalidateQueries({
      queryKey: ["cart"]
    });
  };
  const remove = async (id) => {
    await supabase.from("cart_items").delete().eq("id", id);
    qc.invalidateQueries({
      queryKey: ["cart"]
    });
  };
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1100px] px-6 py-12 md:py-16", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-10 font-serif text-5xl font-medium", children: "Your Cart" }),
    items.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "py-16 text-center text-muted-warm", children: [
      "Your cart is empty. ",
      /* @__PURE__ */ jsx(Link, { to: "/shop", className: "underline", children: "Start shopping" }),
      "."
    ] }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-12 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-6 lg:col-span-2", children: items.map((i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4 border-b border-ink/10 pb-6", children: [
        /* @__PURE__ */ jsx("img", { src: primaryImage(i.products), alt: i.products.name, className: "size-24 rounded-md object-cover" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg", children: i.products.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-warm", children: [
                "Size ",
                i.size
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatNaira(Number(i.products.price) * i.quantity) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-full border border-ink/20 px-3 py-1.5", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setQty(i.id, i.quantity - 1), children: /* @__PURE__ */ jsx(Minus, { className: "size-3.5" }) }),
              /* @__PURE__ */ jsx("span", { className: "w-5 text-center text-sm", children: i.quantity }),
              /* @__PURE__ */ jsx("button", { onClick: () => setQty(i.id, i.quantity + 1), children: /* @__PURE__ */ jsx(Plus, { className: "size-3.5" }) })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => remove(i.id), "aria-label": "Remove", children: /* @__PURE__ */ jsx(Trash2, { className: "size-4 text-muted-warm hover:text-ink" }) })
          ] })
        ] })
      ] }, i.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "h-fit rounded-[12px] border border-ink/10 bg-card p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-6 font-serif text-2xl", children: "Order Summary" }),
        /* @__PURE__ */ jsx(Row, { label: "Subtotal", value: formatNaira(subtotal) }),
        /* @__PURE__ */ jsx(Row, { label: "Delivery", value: formatNaira(DELIVERY_FEE) }),
        /* @__PURE__ */ jsx("div", { className: "my-4 h-px bg-ink/10" }),
        /* @__PURE__ */ jsx(Row, { label: "Total", value: formatNaira(total), bold: true }),
        /* @__PURE__ */ jsx(Link, { to: "/checkout", className: "mt-6 block rounded-full bg-ink py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-canvas", children: "Proceed to Checkout" })
      ] })
    ] })
  ] }) });
}
function Row({
  label,
  value,
  bold
}) {
  return /* @__PURE__ */ jsxs("div", { className: `flex justify-between py-1 ${bold ? "text-lg font-medium" : "text-sm text-muted-warm"}`, children: [
    /* @__PURE__ */ jsx("span", { children: label }),
    /* @__PURE__ */ jsx("span", { className: bold ? "text-ink" : "", children: value })
  ] });
}
export {
  Cart as component,
  useCart
};
