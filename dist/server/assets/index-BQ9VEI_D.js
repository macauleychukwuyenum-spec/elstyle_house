import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { R as Reveal } from "./Reveal-CT4-nHeC.js";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { P as ProductCard } from "./ProductCard-BeeKo7U2.js";
import { toast } from "sonner";
import { z } from "zod";
import { s as supabase } from "./client-BC8ib9gb.js";
import { p as productsQuery, c as collectionsQuery } from "./catalog-Cy6bWRG4.js";
import "./router-x3seCsFL.js";
import "./client.server-U_pH-Evd.js";
import "@supabase/supabase-js";
import "./format-DildIsQ0.js";
const quotes = [
  {
    text: "The attention to tactile detail is unmatched in the modern market. Wearing AETERNA feels like a quiet conversation with history.",
    author: "Elena Rossi, Vogue Italy"
  },
  {
    text: "A masterclass in restraint. Every piece feels essential, stripped of noise but rich in substance.",
    author: "Julian Vance, Creative Director"
  },
  {
    text: "They don't design clothes; they construct identities. The bespoke tailoring is simply without equal.",
    author: "Marguerite Laurent, Harper's Bazaar"
  }
];
function Testimonials() {
  const trackRef = useRef(null);
  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsx("section", { id: "testimonials", className: "overflow-hidden bg-canvas px-6 py-24 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px]", children: [
    /* @__PURE__ */ jsxs(Reveal, { className: "mb-12 flex items-end justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.4em] text-muted-warm", children: "Voices" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Previous testimonial",
            onClick: () => scrollBy(-1),
            className: "grid size-11 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-canvas",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Next testimonial",
            onClick: () => scrollBy(1),
            className: "grid size-11 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-canvas",
            children: /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: trackRef,
        className: "no-scrollbar flex snap-x snap-mandatory gap-12 overflow-x-auto",
        children: quotes.map((q) => /* @__PURE__ */ jsxs("figure", { className: "min-w-[300px] shrink-0 snap-center md:min-w-[640px]", children: [
          /* @__PURE__ */ jsxs("blockquote", { className: "mb-8 text-pretty font-serif text-3xl italic leading-tight md:text-4xl", children: [
            "“",
            q.text,
            "”"
          ] }),
          /* @__PURE__ */ jsx("figcaption", { className: "text-xs font-medium uppercase tracking-widest text-muted-warm", children: q.author })
        ] }, q.author))
      }
    )
  ] }) });
}
const schema = z.string().trim().email().max(255);
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setEmail("");
    toast.success("Thank you for subscribing!");
  };
  return /* @__PURE__ */ jsx("section", { className: "bg-secondary px-6 py-20 md:px-12 md:py-24", children: /* @__PURE__ */ jsxs(Reveal, { className: "mx-auto flex max-w-[640px] flex-col items-center text-center", children: [
    /* @__PURE__ */ jsx("span", { className: "mb-5 text-[11px] uppercase tracking-[0.4em] text-muted-warm", children: "Newsletter" }),
    /* @__PURE__ */ jsx("h2", { className: "mb-4 font-serif text-4xl font-medium md:text-5xl", children: "Join the House List" }),
    /* @__PURE__ */ jsx("p", { className: "mb-8 text-pretty text-muted-warm", children: "Be the first to see new collections, private previews and styling notes." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "flex w-full max-w-md flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          required: true,
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: "Your email address",
          className: "flex-1 border-b border-ink/25 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "rounded-full bg-ink px-7 py-3 text-sm font-medium text-canvas transition-transform hover:scale-[1.03] disabled:opacity-60",
          children: loading ? "…" : "Subscribe"
        }
      )
    ] })
  ] }) });
}
const heroImg = "/assets/hero-Dqai77rb.jpg";
const why = [{
  title: "Handcrafted",
  body: "Every piece is cut, fitted and finished by hand in our atelier."
}, {
  title: "Bespoke Fit",
  body: "Made-to-measure tailoring shaped to your exact silhouette."
}, {
  title: "Premium Fabric",
  body: "Sourced lace, silk and aso-oke chosen for drape and longevity."
}, {
  title: "Trusted Delivery",
  body: "Carefully packaged and delivered nationwide with care."
}];
function Index() {
  const {
    data: featured = []
  } = useQuery(productsQuery({}));
  const {
    data: collections = []
  } = useQuery(collectionsQuery());
  const bestSellers = featured.filter((p) => p.is_best_seller).slice(0, 4);
  const newArrivals = featured.filter((p) => p.is_new_arrival).slice(0, 4);
  return /* @__PURE__ */ jsxs(SiteShell, { children: [
    /* @__PURE__ */ jsxs("section", { className: "relative flex h-[88vh] min-h-[560px] w-full items-end overflow-hidden px-6 pb-16 md:px-12 md:pb-24", children: [
      /* @__PURE__ */ jsx("img", { src: heroImg, alt: "EL STYLE HOUSE couture", className: "absolute inset-0 h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/30" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full text-canvas", children: [
        /* @__PURE__ */ jsx("p", { className: "mb-4 text-[11px] uppercase tracking-[0.4em] text-canvas/80", children: "EL STYLE HOUSE" }),
        /* @__PURE__ */ jsx("h1", { className: "mb-6 max-w-[18ch] text-balance font-serif text-5xl font-medium leading-tight md:text-7xl", children: "Couture for the Celebrated Woman" }),
        /* @__PURE__ */ jsx("p", { className: "mb-8 max-w-[44ch] text-pretty text-base text-canvas/90", children: "Bridal, lace, event and aso-ebi pieces designed to make every moment unforgettable." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsx(Link, { to: "/shop", className: "rounded-full bg-canvas px-7 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03]", children: "Shop the Collection" }),
          /* @__PURE__ */ jsx(Link, { to: "/custom-orders", className: "rounded-full border border-canvas/60 px-7 py-3 text-sm font-medium text-canvas transition-colors hover:bg-canvas/10", children: "Request Custom Order" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-[1600px] px-6 py-20 md:px-12 md:py-28", children: [
      /* @__PURE__ */ jsxs(Reveal, { className: "mb-12 flex items-end justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-4xl font-medium md:text-5xl", children: "Featured Collections" }),
        /* @__PURE__ */ jsx(Link, { to: "/collections", className: "text-xs uppercase tracking-[0.3em] text-muted-warm hover:text-ink", children: "View all" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: collections.slice(0, 3).map((c) => /* @__PURE__ */ jsxs(Link, { to: "/collections/$slug", params: {
        slug: c.slug
      }, className: "group relative overflow-hidden rounded-[10px]", children: [
        /* @__PURE__ */ jsx("img", { src: c.image_url ?? heroImg, alt: c.name, loading: "lazy", className: "aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" }),
        /* @__PURE__ */ jsx("h3", { className: "absolute bottom-5 left-5 font-serif text-2xl text-canvas", children: c.name })
      ] }, c.id)) })
    ] }),
    bestSellers.length > 0 && /* @__PURE__ */ jsx("section", { className: "bg-secondary px-6 py-20 md:px-12 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px]", children: [
      /* @__PURE__ */ jsxs(Reveal, { className: "mb-12 flex items-end justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-4xl font-medium md:text-5xl", children: "Best Sellers" }),
        /* @__PURE__ */ jsx(Link, { to: "/shop", className: "text-xs uppercase tracking-[0.3em] text-muted-warm hover:text-ink", children: "Shop all" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8", children: bestSellers.map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p.id)) })
    ] }) }),
    newArrivals.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-[1600px] px-6 py-20 md:px-12 md:py-28", children: [
      /* @__PURE__ */ jsxs(Reveal, { className: "mb-12 flex items-end justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-4xl font-medium md:text-5xl", children: "New Arrivals" }),
        /* @__PURE__ */ jsx(Link, { to: "/shop", className: "text-xs uppercase tracking-[0.3em] text-muted-warm hover:text-ink", children: "Shop all" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8", children: newArrivals.map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p.id)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "bg-ink px-6 py-20 text-canvas md:px-12 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px]", children: [
      /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx("h2", { className: "mb-12 font-serif text-4xl font-medium md:text-5xl", children: "Why Choose Us" }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4", children: why.map((w, i) => /* @__PURE__ */ jsx(Reveal, { delay: i * 100, children: /* @__PURE__ */ jsxs("div", { className: "border-t border-canvas/15 pt-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-3 font-serif text-2xl", children: w.title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-canvas/70", children: w.body })
      ] }) }, w.title)) })
    ] }) }),
    /* @__PURE__ */ jsx(Testimonials, {}),
    /* @__PURE__ */ jsx(NewsletterSignup, {})
  ] });
}
export {
  Index as component
};
