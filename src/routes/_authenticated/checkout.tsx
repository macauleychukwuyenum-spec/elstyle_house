import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { useCart } from "./cart";
import { initiateFlutterwavePayment } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — EL STYLE HOUSE" }] }),
  component: Checkout,
});

const DELIVERY_FEE = 5000;
const schema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(30),
  address_line: z.string().trim().min(3).max(300),
  city: z.string().trim().max(120),
  state: z.string().trim().max(120),
});

function Checkout() {
  const { user } = useAuth();
  const { data: items = [] } = useCart();
  const [loading, setLoading] = useState(false);
  const startPayment = useServerFn(initiateFlutterwavePayment);

  const subtotal = items.reduce((s, i) => s + Number(i.products.price) * i.quantity, 0);
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty.");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) return toast.error("Please complete all delivery fields.");
    setLoading(true);

    try {
      const { link } = await startPayment({ data: parsed.data });
      toast.success("Redirecting to secure payment…");
      window.location.href = link;
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Could not start payment. Please try again.");
    }
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <h1 className="mb-10 font-serif text-5xl font-medium">Checkout</h1>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <form onSubmit={submit} className="space-y-5 lg:col-span-2">
            <h2 className="font-serif text-2xl">Delivery Details</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <input name="customer_name" placeholder="Full Name *" required defaultValue={user?.user_metadata?.full_name ?? ""} className={field} />
              <input name="customer_phone" placeholder="Phone *" required className={field} />
              <input name="customer_email" type="email" placeholder="Email *" required defaultValue={user?.email ?? ""} className={field} />
              <input name="city" placeholder="City" className={field} />
              <input name="state" placeholder="State" className={field} />
            </div>
            <input name="address_line" placeholder="Delivery Address *" required className={field} />

            <div className="rounded-[10px] border border-dashed border-ink/25 bg-secondary/50 p-5 text-sm text-muted-warm">
              <p className="font-medium text-ink">Secure payment — Flutterwave</p>
              <p className="mt-1">You'll be redirected to Flutterwave's secure checkout to pay by card or bank transfer. Your order is confirmed automatically once payment succeeds.</p>
            </div>

            <button disabled={loading} className="w-full rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60">
              {loading ? "Redirecting to secure payment…" : "Pay Now"}
            </button>
          </form>

          <div className="h-fit rounded-[12px] border border-ink/10 bg-card p-6">
            <h2 className="mb-6 font-serif text-2xl">Order Summary</h2>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between py-1 text-sm">
                <span className="text-muted-warm">{i.products.name} × {i.quantity}</span>
                <span>{formatNaira(Number(i.products.price) * i.quantity)}</span>
              </div>
            ))}
            <div className="my-4 h-px bg-ink/10" />
            <div className="flex justify-between text-sm text-muted-warm"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-muted-warm"><span>Delivery</span><span>{formatNaira(DELIVERY_FEE)}</span></div>
            <div className="mt-3 flex justify-between text-lg font-medium"><span>Total</span><span>{formatNaira(total)}</span></div>
            <Link to="/cart" className="mt-6 block text-center text-xs uppercase tracking-widest text-muted-warm hover:text-ink">Edit cart</Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}