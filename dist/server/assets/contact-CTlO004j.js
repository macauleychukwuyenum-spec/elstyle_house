import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { S as SiteShell, s as site, w as whatsappLink } from "./SiteShell-B4wyEfn2.js";
import { s as supabase } from "./client-BC8ib9gb.js";
import { u as useAuth } from "./router-x3seCsFL.js";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "./client.server-U_pH-Evd.js";
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(3).max(2e3)
});
function Contact() {
  const {
    user
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error("Please complete the form with a valid email.");
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.from("support_messages").insert({
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    e.target.reset();
    toast.success("Message sent! We'll get back to you soon.");
  };
  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-20", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-12 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-5xl font-medium md:text-6xl", children: "Contact Us" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-warm", children: "We'd love to hear from you." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-16 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsx(Info, { icon: /* @__PURE__ */ jsx(Phone, { className: "size-5" }), label: "Phone", value: site.phoneDisplay }),
        /* @__PURE__ */ jsx(Info, { icon: /* @__PURE__ */ jsx(Mail, { className: "size-5" }), label: "Email", value: site.email, href: `mailto:${site.email}` }),
        /* @__PURE__ */ jsx(Info, { icon: /* @__PURE__ */ jsx(MapPin, { className: "size-5" }), label: "Address", value: site.address }),
        /* @__PURE__ */ jsx(Info, { icon: /* @__PURE__ */ jsx(Clock, { className: "size-5" }), label: "Business Hours", value: site.businessHours }),
        /* @__PURE__ */ jsxs("a", { href: whatsappLink(), target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white", children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "size-5" }),
          " Chat on WhatsApp"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsx("input", { name: "name", placeholder: "Your Name *", required: true, className: field }),
        /* @__PURE__ */ jsx("input", { name: "email", type: "email", placeholder: "Your Email *", required: true, className: field }),
        /* @__PURE__ */ jsx("input", { name: "subject", placeholder: "Subject", className: field }),
        /* @__PURE__ */ jsx("textarea", { name: "message", rows: 5, placeholder: "How can we help? *", required: true, className: field }),
        /* @__PURE__ */ jsx("button", { disabled: loading, className: "rounded-full bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60", children: loading ? "Sending…" : "Send Message" })
      ] })
    ] })
  ] }) });
}
function Info({
  icon,
  label,
  value,
  href
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
    /* @__PURE__ */ jsx("span", { className: "mt-1 text-accent", children: icon }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.3em] text-muted-warm", children: label }),
      href ? /* @__PURE__ */ jsx("a", { href, className: "font-serif text-xl hover:underline", children: value }) : /* @__PURE__ */ jsx("p", { className: "font-serif text-xl", children: value })
    ] })
  ] });
}
export {
  Contact as component
};
