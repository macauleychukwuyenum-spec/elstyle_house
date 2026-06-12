import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DELIVERY_FEE = 5000;
const FLW_BASE = "https://api.flutterwave.com/v3";

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(30),
  address_line: z.string().trim().min(3).max(300),
  city: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().max(120).optional().default(""),
});

function getOrigin(): string {
  const origin = getRequestHeader("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = getRequestHeader("host");
  const proto = getRequestHeader("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "";
}

/**
 * Creates a pending order from the user's cart (amounts computed server-side)
 * and returns a Flutterwave hosted-payment link to redirect the customer to.
 */
export const initiateFlutterwavePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(checkoutSchema)
  .handler(async ({ data, context }) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) throw new Error("Payment is not configured. Please contact support.");

    const { supabase, userId } = context;

    // Load the user's cart with current product prices (trusted server-side source).
    const { data: cart, error: cartError } = await supabase
      .from("cart_items")
      .select("product_id, quantity, size, color, products(name, price)");
    if (cartError) throw new Error("Could not read your cart.");
    if (!cart || cart.length === 0) throw new Error("Your cart is empty.");

    const items = cart.map((row) => {
      const product = row.products as unknown as { name: string; price: number } | null;
      if (!product) throw new Error("A product in your cart is no longer available.");
      return {
        product_id: row.product_id,
        name: product.name,
        price: Number(product.price),
        quantity: row.quantity,
        size: row.size,
        color: row.color,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + DELIVERY_FEE;
    if (total <= 0) throw new Error("Invalid order total.");

    const txRef = `ELSH-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Create the pending order (RLS: user can insert their own order).
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
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
        tx_ref: txRef,
      })
      .select("id")
      .single();
    if (orderError || !order) throw new Error("Could not create your order.");

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
    );
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
        name: data.customer_name,
      },
      customizations: {
        title: "EL STYLE HOUSE",
        description: `Order ${order.id}`,
      },
      meta: { order_id: order.id, user_id: userId },
    };

    const res = await fetch(`${FLW_BASE}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as { status?: string; message?: string; data?: { link?: string } };
    if (!res.ok || body.status !== "success" || !body.data?.link) {
      console.error("[flutterwave] initiate failed", body);
      throw new Error("Could not start payment. Please try again.");
    }

    return { link: body.data.link, orderId: order.id };
  });

/**
 * Verifies a Flutterwave transaction after redirect and marks the order paid
 * when the payment is confirmed successful with a matching amount/currency.
 */
export const verifyFlutterwavePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      transaction_id: z.string().trim().min(1).max(64),
      tx_ref: z.string().trim().min(1).max(120),
    }),
  )
  .handler(async ({ data, context }) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) throw new Error("Payment is not configured.");
    const { userId } = context;

    // Find the user's order for this tx_ref.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, total, status")
      .eq("tx_ref", data.tx_ref)
      .maybeSingle();
    if (orderError || !order) throw new Error("Order not found.");
    if (order.user_id !== userId) throw new Error("This order does not belong to you.");

    if (order.status === "paid") {
      return { status: "paid" as const, orderId: order.id };
    }

    const res = await fetch(
      `${FLW_BASE}/transactions/${encodeURIComponent(data.transaction_id)}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const body = (await res.json()) as {
      status?: string;
      data?: { status?: string; amount?: number; currency?: string; tx_ref?: string; id?: number };
    };

    const tx = body.data;
    const verified =
      res.ok &&
      body.status === "success" &&
      tx?.status === "successful" &&
      tx?.currency === "NGN" &&
      tx?.tx_ref === data.tx_ref &&
      Number(tx?.amount) >= Number(order.total);

    if (!verified) {
      console.error("[flutterwave] verify failed", body);
      return { status: "failed" as const, orderId: order.id };
    }

    await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_ref: String(tx?.id ?? data.transaction_id),
      })
      .eq("id", order.id)
      .neq("status", "paid");

    // Clear the user's cart now that payment succeeded.
    await supabaseAdmin.from("cart_items").delete().eq("user_id", order.user_id);

    return { status: "paid" as const, orderId: order.id };
  });