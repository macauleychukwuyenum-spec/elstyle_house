import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FLW_BASE = "https://api.flutterwave.com/v3";

/**
 * Flutterwave webhook. Public endpoint — verifies the `verif-hash` header
 * against FLUTTERWAVE_WEBHOOK_HASH before doing any work, then confirms the
 * payment via the verify API and marks the order paid (idempotent).
 */
export const Route = createFileRoute("/api/flutterwave-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH;
        const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
        const signature = request.headers.get("verif-hash");

        if (!expected || !signature || signature !== expected) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: {
          event?: string;
          data?: { id?: number; status?: string; tx_ref?: string; amount?: number; currency?: string };
        };
        try {
          event = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const tx = event.data;
        if (!tx?.tx_ref || !tx?.id) {
          return new Response("ok", { status: 200 });
        }

        // Re-verify with Flutterwave before trusting the payload.
        if (!secretKey) return new Response("ok", { status: 200 });
        const res = await fetch(`${FLW_BASE}/transactions/${tx.id}/verify`, {
          headers: { Authorization: `Bearer ${secretKey}` },
        });
        const body = (await res.json()) as {
          status?: string;
          data?: { status?: string; amount?: number; currency?: string; tx_ref?: string; id?: number };
        };
        const v = body.data;
        if (res.ok && body.status === "success" && v?.status === "successful" && v.tx_ref === tx.tx_ref) {
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("id, total, status")
            .eq("tx_ref", tx.tx_ref)
            .maybeSingle();
          if (order && order.status !== "paid" && Number(v.amount) >= Number(order.total)) {
            await supabaseAdmin
              .from("orders")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                payment_ref: String(v.id ?? tx.id),
              })
              .eq("id", order.id)
              .neq("status", "paid");
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});