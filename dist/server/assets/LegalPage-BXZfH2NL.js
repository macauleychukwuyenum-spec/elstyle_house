import { jsx, jsxs } from "react/jsx-runtime";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
function LegalPage({ title, children }) {
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[760px] px-6 py-16 md:py-20", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-8 font-serif text-5xl font-medium", children: title }),
    /* @__PURE__ */ jsx("div", { className: "space-y-5 leading-relaxed text-muted-warm", children })
  ] }) });
}
export {
  LegalPage as L
};
