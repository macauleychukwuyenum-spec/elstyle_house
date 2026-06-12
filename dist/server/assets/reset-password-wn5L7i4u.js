import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { s as supabase } from "./client-BC8ib9gb.js";
import "lucide-react";
import "./router-x3seCsFL.js";
import "@tanstack/react-query";
import "./client.server-U_pH-Evd.js";
import "@supabase/supabase-js";
function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (!z.string().min(6).max(72).safeParse(password).success) {
      return toast.error("Password must be at least 6 characters.");
    }
    if (password !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're now signed in.");
    navigate({
      to: "/account"
    });
  };
  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[440px] px-6 py-20", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-center font-serif text-4xl font-medium", children: "Set a New Password" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-10 space-y-5", children: [
      /* @__PURE__ */ jsx("input", { name: "password", type: "password", placeholder: "New Password", required: true, className: field }),
      /* @__PURE__ */ jsx("input", { name: "confirm", type: "password", placeholder: "Confirm New Password", required: true, className: field }),
      /* @__PURE__ */ jsx("button", { disabled: loading, className: "w-full rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60", children: loading ? "Updating…" : "Update Password" })
    ] })
  ] }) });
}
export {
  ResetPassword as component
};
