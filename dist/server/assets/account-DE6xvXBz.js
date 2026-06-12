import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { s as supabase } from "./client-BC8ib9gb.js";
import { u as useAuth } from "./router-x3seCsFL.js";
import { f as formatNaira } from "./format-DildIsQ0.js";
import "lucide-react";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
function Account() {
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState("profile");
  const {
    data: profile
  } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data
      } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    }
  });
  const {
    data: orders = []
  } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data
      } = await supabase.from("orders").select("*").order("created_at", {
        ascending: false
      });
      return data ?? [];
    }
  });
  const {
    data: reviews = []
  } = useQuery({
    queryKey: ["my-reviews", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data
      } = await supabase.from("reviews").select("*, products(name,slug)").order("created_at", {
        ascending: false
      });
      return data ?? [];
    }
  });
  const saveProfile = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await supabase.from("profiles").update({
      full_name: String(fd.get("full_name") ?? ""),
      phone: String(fd.get("phone") ?? "")
    }).eq("id", user.id);
    qc.invalidateQueries({
      queryKey: ["profile"]
    });
    toast.success("Profile updated.");
  };
  const logout = async () => {
    await signOut();
    navigate({
      to: "/"
    });
  };
  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none focus:border-ink";
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1100px] px-6 py-12 md:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-wrap items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-5xl font-medium", children: "My Account" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        isAdmin && /* @__PURE__ */ jsx(Link, { to: "/admin", className: "rounded-full border border-ink px-5 py-2 text-xs font-bold uppercase tracking-widest", children: "Admin Panel" }),
        /* @__PURE__ */ jsx("button", { onClick: logout, className: "rounded-full bg-ink px-5 py-2 text-xs font-bold uppercase tracking-widest text-canvas", children: "Logout" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex gap-6 border-b border-ink/10 text-sm uppercase tracking-widest", children: [
      ["profile", "orders", "reviews"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setTab(t), className: `pb-3 ${tab === t ? "border-b-2 border-ink" : "text-muted-warm"}`, children: t }, t)),
      /* @__PURE__ */ jsx(Link, { to: "/wishlist", className: "pb-3 text-muted-warm hover:text-ink", children: "wishlist" })
    ] }),
    tab === "profile" && /* @__PURE__ */ jsxs("form", { onSubmit: saveProfile, className: "max-w-md space-y-5", children: [
      /* @__PURE__ */ jsx("input", { name: "full_name", defaultValue: profile?.full_name ?? "", placeholder: "Full Name", className: field }),
      /* @__PURE__ */ jsx("input", { name: "phone", defaultValue: profile?.phone ?? "", placeholder: "Phone", className: field }),
      /* @__PURE__ */ jsx("input", { defaultValue: user?.email ?? "", disabled: true, className: `${field} opacity-60` }),
      /* @__PURE__ */ jsx("button", { className: "rounded-full bg-ink px-8 py-3 text-xs font-bold uppercase tracking-widest text-canvas", children: "Save Changes" })
    ] }),
    tab === "orders" && (orders.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-warm", children: "You have no orders yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: orders.map((o) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-[10px] border border-ink/10 p-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
          "Order #",
          o.id.slice(0, 8)
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-warm", children: [
          new Date(o.created_at).toLocaleDateString(),
          " · ",
          o.status
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatNaira(o.total) })
    ] }, o.id)) })),
    tab === "reviews" && (reviews.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-warm", children: "You haven't written any reviews yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: reviews.map((r) => /* @__PURE__ */ jsxs("div", { className: "rounded-[10px] border border-ink/10 p-5", children: [
      /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
        r.products?.name,
        " · ",
        r.rating,
        "★ ",
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-warm", children: [
          "(",
          r.status,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-warm", children: r.body })
    ] }, r.id)) }))
  ] }) });
}
export {
  Account as component
};
