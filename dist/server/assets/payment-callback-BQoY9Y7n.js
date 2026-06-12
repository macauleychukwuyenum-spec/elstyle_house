import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useSearch, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { XCircle, Loader2, CheckCircle2 } from "lucide-react";
import { u as useServerFn, v as verifyFlutterwavePayment } from "./payments.functions-BnKCua7T.js";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import "react";
import "./server-CQySRrHc.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
import "./auth-middleware-evZWmw3m.js";
import "@supabase/supabase-js";
import "./router-x3seCsFL.js";
import "./client-BC8ib9gb.js";
import "./client.server-U_pH-Evd.js";
import "sonner";
function PaymentCallback() {
  const {
    status,
    tx_ref,
    transaction_id
  } = useSearch({
    from: "/payment-callback"
  });
  const verify = useServerFn(verifyFlutterwavePayment);
  const cancelled = status === "cancelled" || !transaction_id || !tx_ref;
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["verify-payment", tx_ref, transaction_id],
    enabled: !cancelled,
    retry: 1,
    queryFn: () => verify({
      data: {
        transaction_id,
        tx_ref
      }
    })
  });
  const paid = data?.status === "paid";
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsx("div", { className: "mx-auto flex max-w-[640px] flex-col items-center px-6 py-24 text-center", children: cancelled ? /* @__PURE__ */ jsx(Result, { icon: /* @__PURE__ */ jsx(XCircle, { className: "size-14 text-destructive" }), title: "Payment cancelled", text: "Your payment was not completed. Your items are still in your cart.", cta: {
    to: "/cart",
    label: "Back to cart"
  } }) : isLoading ? /* @__PURE__ */ jsx(Result, { icon: /* @__PURE__ */ jsx(Loader2, { className: "size-14 animate-spin text-muted-warm" }), title: "Confirming your payment…", text: "Please wait while we verify your transaction with Flutterwave." }) : paid ? /* @__PURE__ */ jsx(Result, { icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "size-14 text-[#1f9d55]" }), title: "Payment successful", text: "Thank you! Your order has been confirmed. You can view it in your account.", cta: {
    to: "/account",
    label: "View my orders"
  } }) : /* @__PURE__ */ jsx(Result, { icon: /* @__PURE__ */ jsx(XCircle, { className: "size-14 text-destructive" }), title: "Payment not confirmed", text: isError ? "We couldn't verify this payment. If you were charged, contact us and we'll resolve it." : "This payment was not successful. Please try again from your cart.", cta: {
    to: "/cart",
    label: "Back to cart"
  } }) }) });
}
function Result({
  icon,
  title,
  text,
  cta
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: icon }),
    /* @__PURE__ */ jsx("h1", { className: "mb-4 font-serif text-4xl font-medium", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mb-8 max-w-[44ch] text-pretty text-muted-warm", children: text }),
    cta ? /* @__PURE__ */ jsx(Link, { to: cta.to, className: "rounded-full bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas", children: cta.label }) : null
  ] });
}
export {
  PaymentCallback as component
};
