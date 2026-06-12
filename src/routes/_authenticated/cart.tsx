import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { primaryImage, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Cart — EL STYLE HOUSE" }] }),
  component: Cart,
});

const DELIVERY_FEE = 5000;

export type CartRow = {
  id: string;
  product_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  products: Product;
};

export function useCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity, size, color, products(*, product_images(*))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CartRow[];
    },
  });
}

function Cart() {
  const qc = useQueryClient();
  const { data: items = [] } = useCart();

  const subtotal = items.reduce((s, i) => s + Number(i.products.price) * i.quantity, 0);
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);

  const setQty = async (id: string, q: number) => {
    if (q < 1) return;
    await supabase.from("cart_items").update({ quantity: q }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };
  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <h1 className="mb-10 font-serif text-5xl font-medium">Your Cart</h1>
        {items.length === 0 ? (
          <p className="py-16 text-center text-muted-warm">
            Your cart is empty. <Link to="/shop" className="underline">Start shopping</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {items.map((i) => (
                <div key={i.id} className="flex gap-4 border-b border-ink/10 pb-6">
                  <img src={primaryImage(i.products)} alt={i.products.name} className="size-24 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-serif text-lg">{i.products.name}</h3>
                        <p className="text-xs text-muted-warm">Size {i.size}</p>
                      </div>
                      <p className="font-medium">{formatNaira(Number(i.products.price) * i.quantity)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full border border-ink/20 px-3 py-1.5">
                        <button onClick={() => setQty(i.id, i.quantity - 1)}><Minus className="size-3.5" /></button>
                        <span className="w-5 text-center text-sm">{i.quantity}</span>
                        <button onClick={() => setQty(i.id, i.quantity + 1)}><Plus className="size-3.5" /></button>
                      </div>
                      <button onClick={() => remove(i.id)} aria-label="Remove"><Trash2 className="size-4 text-muted-warm hover:text-ink" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-[12px] border border-ink/10 bg-card p-6">
              <h2 className="mb-6 font-serif text-2xl">Order Summary</h2>
              <Row label="Subtotal" value={formatNaira(subtotal)} />
              <Row label="Delivery" value={formatNaira(DELIVERY_FEE)} />
              <div className="my-4 h-px bg-ink/10" />
              <Row label="Total" value={formatNaira(total)} bold />
              <Link to="/checkout" className="mt-6 block rounded-full bg-ink py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-canvas">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "text-lg font-medium" : "text-sm text-muted-warm"}`}>
      <span>{label}</span>
      <span className={bold ? "text-ink" : ""}>{value}</span>
    </div>
  );
}