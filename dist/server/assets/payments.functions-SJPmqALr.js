import { T as TSS_SERVER_FUNCTION, a as createServerFn, g as getRequestHeader } from "./server-CQySRrHc.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-evZWmw3m.js";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const DELIVERY_FEE = 5e3;
const FLW_BASE = "https://api.flutterwave.com/v3";
const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(30),
  address_line: z.string().trim().min(3).max(300),
  city: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().max(120).optional().default("")
});
function getOrigin() {
  const origin = getRequestHeader("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = getRequestHeader("host");
  const proto = getRequestHeader("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "";
}
const initiateFlutterwavePayment_createServerFn_handler = createServerRpc({
  id: "b6cd6f639b0395ed6343660394aa0c5a941b7c8557ba00c028aad95c3fb2ddc3",
  name: "initiateFlutterwavePayment",
  filename: "src/lib/payments.functions.ts"
}, (opts) => initiateFlutterwavePayment.__executeServer(opts));
const initiateFlutterwavePayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(checkoutSchema).handler(initiateFlutterwavePayment_createServerFn_handler, async ({
  data,
  context
}) => {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) throw new Error("Payment is not configured. Please contact support.");
  const {
    supabase,
    userId
  } = context;
  const {
    data: cart,
    error: cartError
  } = await supabase.from("cart_items").select("product_id, quantity, size, color, products(name, price)");
  if (cartError) throw new Error("Could not read your cart.");
  if (!cart || cart.length === 0) throw new Error("Your cart is empty.");
  const items = cart.map((row) => {
    const product = row.products;
    if (!product) throw new Error("A product in your cart is no longer available.");
    return {
      product_id: row.product_id,
      name: product.name,
      price: Number(product.price),
      quantity: row.quantity,
      size: row.size,
      color: row.color
    };
  });
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;
  if (total <= 0) throw new Error("Invalid order total.");
  const txRef = `ELSH-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const {
    data: order,
    error: orderError
  } = await supabase.from("orders").insert({
    user_id: userId,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    address_line: data.address_line,
    city: data.city,
    state: data.state,
    subtotal,
    delivery_fee: DELIVERY_FEE,
    total,
    status: "pending",
    payment_provider: "flutterwave",
    tx_ref: txRef
  }).select("id").single();
  if (orderError || !order) throw new Error("Could not create your order.");
  const {
    error: itemsError
  } = await supabase.from("order_items").insert(items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    size: i.size,
    color: i.color
  })));
  if (itemsError) throw new Error("Could not save your order items.");
  const origin = getOrigin();
  const payload = {
    tx_ref: txRef,
    amount: total,
    currency: "NGN",
    redirect_url: `${origin}/payment-callback`,
    customer: {
      email: data.customer_email,
      phonenumber: data.customer_phone,
      name: data.customer_name
    },
    customizations: {
      title: "EL STYLE HOUSE",
      description: `Order ${order.id}`
    },
    meta: {
      order_id: order.id,
      user_id: userId
    }
  };
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const body = await res.json();
  if (!res.ok || body.status !== "success" || !body.data?.link) {
    console.error("[flutterwave] initiate failed", body);
    throw new Error("Could not start payment. Please try again.");
  }
  return {
    link: body.data.link,
    orderId: order.id
  };
});
const verifyFlutterwavePayment_createServerFn_handler = createServerRpc({
  id: "74404dd995358838a5931235b65a01a36b76503fa957a39208125146b6b8e585",
  name: "verifyFlutterwavePayment",
  filename: "src/lib/payments.functions.ts"
}, (opts) => verifyFlutterwavePayment.__executeServer(opts));
const verifyFlutterwavePayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  transaction_id: z.string().trim().min(1).max(64),
  tx_ref: z.string().trim().min(1).max(120)
})).handler(verifyFlutterwavePayment_createServerFn_handler, async ({
  data,
  context
}) => {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) throw new Error("Payment is not configured.");
  const {
    userId
  } = context;
  const {
    data: order,
    error: orderError
  } = await supabaseAdmin.from("orders").select("id, user_id, total, status").eq("tx_ref", data.tx_ref).maybeSingle();
  if (orderError || !order) throw new Error("Order not found.");
  if (order.user_id !== userId) throw new Error("This order does not belong to you.");
  if (order.status === "paid") {
    return {
      status: "paid",
      orderId: order.id
    };
  }
  const res = await fetch(`${FLW_BASE}/transactions/${encodeURIComponent(data.transaction_id)}/verify`, {
    headers: {
      Authorization: `Bearer ${secretKey}`
    }
  });
  const body = await res.json();
  const tx = body.data;
  const verified = res.ok && body.status === "success" && tx?.status === "successful" && tx?.currency === "NGN" && tx?.tx_ref === data.tx_ref && Number(tx?.amount) >= Number(order.total);
  if (!verified) {
    console.error("[flutterwave] verify failed", body);
    return {
      status: "failed",
      orderId: order.id
    };
  }
  await supabaseAdmin.from("orders").update({
    status: "paid",
    paid_at: (/* @__PURE__ */ new Date()).toISOString(),
    payment_ref: String(tx?.id ?? data.transaction_id)
  }).eq("id", order.id).neq("status", "paid");
  await supabaseAdmin.from("cart_items").delete().eq("user_id", order.user_id);
  return {
    status: "paid",
    orderId: order.id
  };
});
export {
  initiateFlutterwavePayment_createServerFn_handler,
  verifyFlutterwavePayment_createServerFn_handler
};
