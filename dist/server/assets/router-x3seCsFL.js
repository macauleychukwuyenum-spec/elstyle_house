import { QueryClientProvider, useQuery, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from "react";
import { s as supabase } from "./client-BC8ib9gb.js";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
import { createClient } from "@supabase/supabase-js";
const appCss = "/assets/styles-D9HjwPDt.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const fallbackAdminEmails = "macauleychukwuyenum@gmail.com".split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
const AuthContext = createContext({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {
  }
});
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkRole = (authUser) => {
      if (!authUser?.id) {
        setIsAdmin(false);
        return;
      }
      const fallbackAdmin = fallbackAdminEmails.includes(
        (authUser.email ?? "").toLowerCase()
      );
      if (fallbackAdmin) {
        setIsAdmin(true);
        return;
      }
      setTimeout(async () => {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", authUser.id).eq("role", "admin").maybeSingle();
        setIsAdmin(!!data);
      }, 0);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      checkRole(s?.user);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      checkRole(data.session?.user);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, session, isAdmin, loading, signOut }, children });
}
function useAuth() {
  return useContext(AuthContext);
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$r = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EL STYLE HOUSE — Luxury Fashion & Couture" },
      {
        name: "description",
        content: "EL STYLE HOUSE is a luxury fashion brand crafting bridal, lace, event and aso-ebi couture. Shop the collection or request a custom order."
      },
      { name: "author", content: "EL STYLE HOUSE" },
      { property: "og:title", content: "EL STYLE HOUSE — Luxury Fashion & Couture" },
      {
        property: "og:description",
        content: "Luxury bridal, lace, event and aso-ebi couture. Shop or request a custom order."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "EL STYLE HOUSE — Luxury Fashion & Couture" },
      { name: "description", content: "Elegant Fashion Studio is a responsive website showcasing fashion collections with interactive design elements." },
      { property: "og:description", content: "Elegant Fashion Studio is a responsive website showcasing fashion collections with interactive design elements." },
      { name: "twitter:description", content: "Elegant Fashion Studio is a responsive website showcasing fashion collections with interactive design elements." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/32a3188e-ad53-48e3-a92e-6b0dd0f2be21/id-preview-9d2f939b--8e5e377e-b42a-42f7-9c29-beafbb5a9871.lovable.app-1780927091984.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/32a3188e-ad53-48e3-a92e-6b0dd0f2be21/id-preview-9d2f939b--8e5e377e-b42a-42f7-9c29-beafbb5a9871.lovable.app-1780927091984.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Sans:wght@400;500;600&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$r.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }) });
}
const $$splitComponentImporter$n = () => import("./terms-CvDTuDb_.js");
const Route$q = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: "Terms & Conditions — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const BASE_URL = "";
const Route$p = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [{ path: "/", changefreq: "weekly", priority: "1.0" }];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$m = () => import("./shop-CXEdrZDv.js");
const Route$o = createFileRoute("/shop")({
  head: () => ({
    meta: [{
      title: "Shop — EL STYLE HOUSE"
    }, {
      name: "description",
      content: "Browse luxury dresses, gowns, lace and aso-ebi pieces from EL STYLE HOUSE."
    }, {
      property: "og:title",
      content: "Shop — EL STYLE HOUSE"
    }, {
      property: "og:description",
      content: "Browse luxury couture pieces from EL STYLE HOUSE."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./shipping-policy-DBSfTdu1.js");
const Route$n = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [{
      title: "Shipping Policy — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./return-policy-0MdYkHtI.js");
const Route$m = createFileRoute("/return-policy")({
  head: () => ({
    meta: [{
      title: "Return Policy — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./reset-password-wn5L7i4u.js");
const Route$l = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Reset Password — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./privacy-CjJrtFk2.js");
const Route$k = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./payment-callback-BQoY9Y7n.js");
const Route$j = createFileRoute("/payment-callback")({
  head: () => ({
    meta: [{
      title: "Payment — EL STYLE HOUSE"
    }]
  }),
  validateSearch: (search) => ({
    status: typeof search.status === "string" ? search.status : void 0,
    tx_ref: typeof search.tx_ref === "string" ? search.tx_ref : void 0,
    transaction_id: typeof search.transaction_id === "string" ? search.transaction_id : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./faq-D6zy42Ij.js");
const Route$i = createFileRoute("/faq")({
  head: () => ({
    meta: [{
      title: "FAQ — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./custom-orders-N3CxxyR8.js");
const Route$h = createFileRoute("/custom-orders")({
  head: () => ({
    meta: [{
      title: "Custom Orders — EL STYLE HOUSE"
    }, {
      name: "description",
      content: "Request a bespoke, made-to-measure piece from EL STYLE HOUSE. Share your occasion, measurements and inspiration."
    }, {
      property: "og:title",
      content: "Custom Orders — EL STYLE HOUSE"
    }, {
      property: "og:description",
      content: "Request a bespoke, made-to-measure couture piece."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./contact-CTlO004j.js");
const Route$g = createFileRoute("/contact")({
  head: () => ({
    meta: [{
      title: "Contact — EL STYLE HOUSE"
    }, {
      name: "description",
      content: "Get in touch with EL STYLE HOUSE by phone, email or WhatsApp."
    }, {
      property: "og:title",
      content: "Contact — EL STYLE HOUSE"
    }, {
      property: "og:description",
      content: "Reach EL STYLE HOUSE by phone, email or WhatsApp."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./collections-CAIp7X9F.js");
const Route$f = createFileRoute("/collections")({
  head: () => ({
    meta: [{
      title: "Collections — EL STYLE HOUSE"
    }, {
      name: "description",
      content: "Explore the Bridal, Luxury Lace, Event, Aso-Ebi and Signature collections by EL STYLE HOUSE."
    }, {
      property: "og:title",
      content: "Collections — EL STYLE HOUSE"
    }, {
      property: "og:description",
      content: "Bridal, lace, event, aso-ebi and signature couture collections."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./blog-BB-SCOKz.js");
const Route$e = createFileRoute("/blog")({
  head: () => ({
    meta: [{
      title: "Journal — EL STYLE HOUSE"
    }, {
      name: "description",
      content: "Fashion tips, style guides, trends and news from EL STYLE HOUSE."
    }, {
      property: "og:title",
      content: "Journal — EL STYLE HOUSE"
    }, {
      property: "og:description",
      content: "Fashion tips, style guides and news from EL STYLE HOUSE."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./auth-giiqo8sn.js");
const Route$d = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "Account — EL STYLE HOUSE"
    }, {
      name: "description",
      content: "Log in or create your EL STYLE HOUSE account."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./about-7fkg_m9L.js");
const Route$c = createFileRoute("/about")({
  head: () => ({
    meta: [{
      title: "About — EL STYLE HOUSE"
    }, {
      name: "description",
      content: "The story, mission and values behind EL STYLE HOUSE — a luxury fashion brand crafting couture by hand."
    }, {
      property: "og:title",
      content: "About — EL STYLE HOUSE"
    }, {
      property: "og:description",
      content: "The story and values behind EL STYLE HOUSE couture."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./route-BFsOu0JM.js");
const Route$b = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({
      to: "/auth"
    });
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./index-BQ9VEI_D.js");
const Route$a = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "EL STYLE HOUSE — Luxury Fashion & Couture"
    }, {
      name: "description",
      content: "EL STYLE HOUSE crafts luxury bridal, lace, event and aso-ebi couture. Shop the collection or request a bespoke custom order."
    }, {
      property: "og:title",
      content: "EL STYLE HOUSE — Luxury Fashion & Couture"
    }, {
      property: "og:description",
      content: "Luxury bridal, lace, event and aso-ebi couture. Shop or request a custom order."
    }, {
      property: "og:image",
      content: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80"
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./product._slug-CEGm-XS_.js");
const Route$9 = createFileRoute("/product/$slug")({
  head: ({
    params
  }) => ({
    meta: [{
      title: `${params.slug.replace(/-/g, " ")} — EL STYLE HOUSE`
    }, {
      name: "description",
      content: "Shop this piece from EL STYLE HOUSE couture."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./collections._slug-DrMGIEA1.js");
const Route$8 = createFileRoute("/collections/$slug")({
  head: ({
    params
  }) => ({
    meta: [{
      title: `${params.slug.replace(/-/g, " ")} Collection — EL STYLE HOUSE`
    }, {
      name: "description",
      content: "Explore this collection from EL STYLE HOUSE."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./blog._slug-3X_aivPD.js");
const Route$7 = createFileRoute("/blog/$slug")({
  head: ({
    params
  }) => ({
    meta: [{
      title: `${params.slug.replace(/-/g, " ")} — EL STYLE HOUSE Journal`
    }, {
      name: "description",
      content: "Read this article from the EL STYLE HOUSE journal."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const FLW_BASE = "https://api.flutterwave.com/v3";
const Route$6 = createFileRoute("/api/flutterwave-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH;
        const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
        const signature = request.headers.get("verif-hash");
        if (!expected || !signature || signature !== expected) {
          return new Response("Invalid signature", { status: 401 });
        }
        let event;
        try {
          event = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        const tx = event.data;
        if (!tx?.tx_ref || !tx?.id) {
          return new Response("ok", { status: 200 });
        }
        if (!secretKey) return new Response("ok", { status: 200 });
        const res = await fetch(`${FLW_BASE}/transactions/${tx.id}/verify`, {
          headers: { Authorization: `Bearer ${secretKey}` }
        });
        const body = await res.json();
        const v = body.data;
        if (res.ok && body.status === "success" && v?.status === "successful" && v.tx_ref === tx.tx_ref) {
          const { data: order } = await supabaseAdmin.from("orders").select("id, total, status").eq("tx_ref", tx.tx_ref).maybeSingle();
          if (order && order.status !== "paid" && Number(v.amount) >= Number(order.total)) {
            await supabaseAdmin.from("orders").update({
              status: "paid",
              paid_at: (/* @__PURE__ */ new Date()).toISOString(),
              payment_ref: String(v.id ?? tx.id)
            }).eq("id", order.id).neq("status", "paid");
          }
        }
        return new Response("ok", { status: 200 });
      }
    }
  }
});
const Route$5 = createFileRoute("/api/admin-users")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireAdmin(request);
        if (!auth.ok) {
          return json({ error: auth.error }, auth.status);
        }
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Bad request body." }, 400);
        }
        if (!body.userId || typeof body.userId !== "string") {
          return json({ error: "Missing user id." }, 400);
        }
        if (body.action === "delete") {
          if (body.userId === auth.userId) {
            return json({ error: "You cannot delete your own account from the admin panel." }, 400);
          }
          const { error } = await supabaseAdmin.auth.admin.deleteUser(body.userId);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        if (body.action === "set_admin") {
          if (body.userId === auth.userId && body.enabled === false) {
            return json({ error: "You cannot remove your own admin access." }, 400);
          }
          if (body.enabled) {
            const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: body.userId, role: "admin" }, { onConflict: "user_id,role" });
            if (error) return json({ error: error.message }, 500);
          } else {
            const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", body.userId).eq("role", "admin");
            if (error) return json({ error: error.message }, 500);
          }
          return json({ ok: true });
        }
        return json({ error: "Unsupported admin action." }, 400);
      }
    }
  }
});
async function requireAdmin(request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return { ok: false, status: 500, error: "Supabase server env is not configured." };
  }
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  if (!token) return { ok: false, status: 401, error: "Missing bearer token." };
  const authedSupabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const { data, error } = await authedSupabase.auth.getUser(token);
  const userId = data.user?.id;
  if (error || !userId) return { ok: false, status: 401, error: "Invalid session." };
  const { data: role, error: roleError } = await authedSupabase.from("user_roles").select("id").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (roleError || !role) {
    return { ok: false, status: 403, error: "Admin access required." };
  }
  return { ok: true, userId };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}
const $$splitComponentImporter$4 = () => import("./wishlist-D1KVLsMX.js");
const Route$4 = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [{
      title: "Wishlist — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./checkout-owQ6TklJ.js");
const Route$3 = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [{
      title: "Checkout — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./cart-sQNWNXRC.js");
const Route$2 = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [{
      title: "Cart — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
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
const $$splitComponentImporter$1 = () => import("./admin-C4FJjrcU.js");
const Route$1 = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{
      title: "Admin Panel - EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./account-DE6xvXBz.js");
const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [{
      title: "My Account — EL STYLE HOUSE"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TermsRoute = Route$q.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$r
});
const SitemapDotxmlRoute = Route$p.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$r
});
const ShopRoute = Route$o.update({
  id: "/shop",
  path: "/shop",
  getParentRoute: () => Route$r
});
const ShippingPolicyRoute = Route$n.update({
  id: "/shipping-policy",
  path: "/shipping-policy",
  getParentRoute: () => Route$r
});
const ReturnPolicyRoute = Route$m.update({
  id: "/return-policy",
  path: "/return-policy",
  getParentRoute: () => Route$r
});
const ResetPasswordRoute = Route$l.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$r
});
const PrivacyRoute = Route$k.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$r
});
const PaymentCallbackRoute = Route$j.update({
  id: "/payment-callback",
  path: "/payment-callback",
  getParentRoute: () => Route$r
});
const FaqRoute = Route$i.update({
  id: "/faq",
  path: "/faq",
  getParentRoute: () => Route$r
});
const CustomOrdersRoute = Route$h.update({
  id: "/custom-orders",
  path: "/custom-orders",
  getParentRoute: () => Route$r
});
const ContactRoute = Route$g.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => Route$r
});
const CollectionsRoute = Route$f.update({
  id: "/collections",
  path: "/collections",
  getParentRoute: () => Route$r
});
const BlogRoute = Route$e.update({
  id: "/blog",
  path: "/blog",
  getParentRoute: () => Route$r
});
const AuthRoute = Route$d.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$r
});
const AboutRoute = Route$c.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => Route$r
});
const AuthenticatedRouteRoute = Route$b.update({
  id: "/_authenticated",
  getParentRoute: () => Route$r
});
const IndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$r
});
const ProductSlugRoute = Route$9.update({
  id: "/product/$slug",
  path: "/product/$slug",
  getParentRoute: () => Route$r
});
const CollectionsSlugRoute = Route$8.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => CollectionsRoute
});
const BlogSlugRoute = Route$7.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => BlogRoute
});
const ApiFlutterwaveWebhookRoute = Route$6.update({
  id: "/api/flutterwave-webhook",
  path: "/api/flutterwave-webhook",
  getParentRoute: () => Route$r
});
const ApiAdminUsersRoute = Route$5.update({
  id: "/api/admin-users",
  path: "/api/admin-users",
  getParentRoute: () => Route$r
});
const AuthenticatedWishlistRoute = Route$4.update({
  id: "/wishlist",
  path: "/wishlist",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCheckoutRoute = Route$3.update({
  id: "/checkout",
  path: "/checkout",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCartRoute = Route$2.update({
  id: "/cart",
  path: "/cart",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAdminRoute = Route$1.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAccountRoute = Route.update({
  id: "/account",
  path: "/account",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedAccountRoute,
  AuthenticatedAdminRoute,
  AuthenticatedCartRoute,
  AuthenticatedCheckoutRoute,
  AuthenticatedWishlistRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const BlogRouteChildren = {
  BlogSlugRoute
};
const BlogRouteWithChildren = BlogRoute._addFileChildren(BlogRouteChildren);
const CollectionsRouteChildren = {
  CollectionsSlugRoute
};
const CollectionsRouteWithChildren = CollectionsRoute._addFileChildren(
  CollectionsRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AboutRoute,
  AuthRoute,
  BlogRoute: BlogRouteWithChildren,
  CollectionsRoute: CollectionsRouteWithChildren,
  ContactRoute,
  CustomOrdersRoute,
  FaqRoute,
  PaymentCallbackRoute,
  PrivacyRoute,
  ResetPasswordRoute,
  ReturnPolicyRoute,
  ShippingPolicyRoute,
  ShopRoute,
  SitemapDotxmlRoute,
  TermsRoute,
  ApiAdminUsersRoute,
  ApiFlutterwaveWebhookRoute,
  ProductSlugRoute
};
const routeTree = Route$r._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$9 as R,
  Route$8 as a,
  Route$7 as b,
  useCart as c,
  router as r,
  useAuth as u
};
