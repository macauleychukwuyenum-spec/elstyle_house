import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { u as useServerFn, i as initiateFlutterwavePayment } from "./payments.functions-BnKCua7T.js";
import { toast } from "sonner";
import { z } from "zod";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { u as useAuth, c as useCart } from "./router-x3seCsFL.js";
import { f as formatNaira } from "./format-DildIsQ0.js";
import "./server-CQySRrHc.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-evZWmw3m.js";
import "@supabase/supabase-js";
import "lucide-react";
import "@tanstack/react-query";
import "./client-BC8ib9gb.js";
import "./client.server-U_pH-Evd.js";
const DELIVERY_FEE = 5e3;
const schema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(30),
  address_line: z.string().trim().min(3).max(300),
  city: z.string().trim().max(120),
  state: z.string().trim().max(120)
});
function Checkout() {
  const {
    user
  } = useAuth();
  const {
    data: items = []
  } = useCart();
  const [loading, setLoading] = useState(false);
  const startPayment = useServerFn(initiateFlutterwavePayment);
  const subtotal = items.reduce((s, i) => s + Number(i.products.price) * i.quantity, 0);
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);
  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty.");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) return toast.error("Please complete all delivery fields.");
    setLoading(true);
    try {
      const {
        link
      } = await startPayment({
        data: parsed.data
      });
      toast.success("Redirecting to secure payment…");
      window.location.href = link;
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Could not start payment. Please try again.");
    }
  };
  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1100px] px-6 py-12 md:py-16", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-10 font-serif text-5xl font-medium", children: "Checkout" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-12 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5 lg:col-span-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl", children: "Delivery Details" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx("input", { name: "customer_name", placeholder: "Full Name *", required: true, defaultValue: user?.user_metadata?.full_name ?? "", className: field }),
          /* @__PURE__ */ jsx("input", { name: "customer_phone", placeholder: "Phone *", required: true, className: field }),
          /* @__PURE__ */ jsx("input", { name: "customer_email", type: "email", placeholder: "Email *", required: true, defaultValue: user?.email ?? "", className: field }),
          /* @__PURE__ */ jsx("input", { name: "city", placeholder: "City", className: field }),
          /* @__PURE__ */ jsx("input", { name: "state", placeholder: "State", className: field })
        ] }),
        /* @__PURE__ */ jsx("input", { name: "address_line", placeholder: "Delivery Address *", required: true, className: field }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-[10px] border border-dashed border-ink/25 bg-secondary/50 p-5 text-sm text-muted-warm", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-ink", children: "Secure payment — Flutterwave" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1", children: "You'll be redirected to Flutterwave's secure checkout to pay by card or bank transfer. Your order is confirmed automatically once payment succeeds." })
        ] }),
        /* @__PURE__ */ jsx("button", { disabled: loading, className: "w-full rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60", children: loading ? "Redirecting to secure payment…" : "Pay Now" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "h-fit rounded-[12px] border border-ink/10 bg-card p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-6 font-serif text-2xl", children: "Order Summary" }),
        items.map((i) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-1 text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-warm", children: [
            i.products.name,
            " × ",
            i.quantity
          ] }),
          /* @__PURE__ */ jsx("span", { children: formatNaira(Number(i.products.price) * i.quantity) })
        ] }, i.id)),
        /* @__PURE__ */ jsx("div", { className: "my-4 h-px bg-ink/10" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-muted-warm", children: [
          /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
          /* @__PURE__ */ jsx("span", { children: formatNaira(subtotal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-muted-warm", children: [
          /* @__PURE__ */ jsx("span", { children: "Delivery" }),
          /* @__PURE__ */ jsx("span", { children: formatNaira(DELIVERY_FEE) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex justify-between text-lg font-medium", children: [
          /* @__PURE__ */ jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsx("span", { children: formatNaira(total) })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/cart", className: "mt-6 block text-center text-xs uppercase tracking-widest text-muted-warm hover:text-ink", children: "Edit cart" })
      ] })
    ] })
  ] }) });
}
export {
  Checkout as component
};
