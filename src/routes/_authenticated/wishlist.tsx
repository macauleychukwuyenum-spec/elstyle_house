import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { primaryImage, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — EL STYLE HOUSE" }] }),
  component: Wishlist,
});

type Row = { id: string; product_id: string; products: Product };

function Wishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("id, product_id, products(*, product_images(*), collections(name,slug))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const remove = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  };

  const moveToCart = async (row: Row) => {
    if (!user) return;
    await supabase.from("cart_items").upsert(
      { user_id: user.id, product_id: row.product_id, quantity: 1, size: "M", color: "As shown" },
      { onConflict: "user_id,product_id,size,color" },
    );
    await supabase.from("wishlists").delete().eq("id", row.id);
    qc.invalidateQueries({ queryKey: ["wishlist"] });
    qc.invalidateQueries({ queryKey: ["cart"] });
    toast.success("Moved to cart.");
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <h1 className="mb-10 font-serif text-5xl font-medium">My Wishlist</h1>
        {items.length === 0 ? (
          <p className="py-16 text-center text-muted-warm">
            Your wishlist is empty. <Link to="/shop" className="underline">Browse the shop</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((row) => (
              <div key={row.id} className="overflow-hidden rounded-[10px] border border-ink/10">
                <Link to="/product/$slug" params={{ slug: row.products.slug }}>
                  <img src={primaryImage(row.products)} alt={row.products.name} className="aspect-[4/5] w-full object-cover" />
                </Link>
                <div className="p-4">
                  <h3 className="font-serif text-lg">{row.products.name}</h3>
                  <p className="text-sm text-muted-warm">{formatNaira(row.products.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => moveToCart(row)} className="flex-1 rounded-full bg-ink py-2 text-xs font-bold uppercase tracking-widest text-canvas">
                      Move to Cart
                    </button>
                    <button onClick={() => remove(row.id)} aria-label="Remove" className="grid size-9 place-items-center rounded-full border border-ink/15 hover:bg-secondary">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}