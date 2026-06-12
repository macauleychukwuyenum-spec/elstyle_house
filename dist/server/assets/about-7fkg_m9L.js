import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { R as Reveal } from "./Reveal-CT4-nHeC.js";
import "react";
import "lucide-react";
import "./router-x3seCsFL.js";
import "@tanstack/react-query";
import "./client-BC8ib9gb.js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
import "sonner";
const maker = "/assets/maker-pC26L-qk.jpg";
const values = [{
  title: "Craft",
  body: "We honour traditional techniques, finishing every seam by hand."
}, {
  title: "Individuality",
  body: "Each woman is unique; her wardrobe should be too."
}, {
  title: "Excellence",
  body: "Only the finest fabrics and the highest standards make it to you."
}];
function About() {
  return /* @__PURE__ */ jsxs(SiteShell, { children: [
    /* @__PURE__ */ jsxs("section", { className: "mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-20 md:px-12 md:py-24", children: [
      /* @__PURE__ */ jsxs(Reveal, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-[0.4em] text-muted-warm", children: "Our Story" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-4 font-serif text-5xl font-medium leading-tight md:text-6xl", children: "Designed to Be Remembered" }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-[52ch] text-pretty leading-relaxed text-muted-warm", children: "EL STYLE HOUSE was born from a love of elegant, intentional design. We create couture pieces for bridal, lace, event and aso-ebi moments — garments made to be felt, not just worn. Every piece is cut, fitted and finished by hand in our atelier." })
      ] }),
      /* @__PURE__ */ jsx(Reveal, { delay: 150, children: /* @__PURE__ */ jsx("figure", { className: "overflow-hidden rounded-[12px]", children: /* @__PURE__ */ jsx("img", { src: maker, alt: "EL STYLE HOUSE atelier", className: "aspect-[4/5] w-full object-cover" }) }) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "bg-ink px-6 py-20 text-canvas md:px-12 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Reveal, { children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-serif text-3xl", children: "Our Mission" }),
        /* @__PURE__ */ jsx("p", { className: "text-canvas/75", children: "To make every woman feel unmistakably herself — confident, celebrated and beautifully dressed for life's defining moments." })
      ] }),
      /* @__PURE__ */ jsxs(Reveal, { delay: 120, children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-serif text-3xl", children: "Our Vision" }),
        /* @__PURE__ */ jsx("p", { className: "text-canvas/75", children: "To become the most loved couture house for the modern African woman, blending heritage with contemporary elegance." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-12 font-serif text-4xl font-medium md:text-5xl", children: "Core Values" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-10 md:grid-cols-3", children: values.map((v, i) => /* @__PURE__ */ jsx(Reveal, { delay: i * 100, children: /* @__PURE__ */ jsxs("div", { className: "border-t border-ink/15 pt-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-3 font-serif text-2xl", children: v.title }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-warm", children: v.body })
      ] }) }, v.title)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-16 text-center", children: /* @__PURE__ */ jsx(Link, { to: "/custom-orders", className: "rounded-full bg-ink px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas", children: "Work With Us" }) })
    ] })
  ] });
}
export {
  About as component
};
