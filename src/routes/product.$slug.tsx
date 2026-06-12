import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, Minus, Plus } from "lucide-react";
import { z } from "zod";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import {
  productQuery,
  reviewsQuery,
  productsQuery,
  primaryImage,
} from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — EL STYLE HOUSE` },
      { name: "description", content: "Shop this piece from EL STYLE HOUSE couture." },
    ],
  }),
  component: ProductPage,
});

const SIZES = ["XS", "S", "M", "L", "XL"];

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: related = [] } = useQuery(productsQuery({}));

  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return <SiteShell><p className="py-32 text-center text-muted-warm">Loading…</p></SiteShell>;
  }
  if (!product) {
    return (
      <SiteShell>
        <div className="py-32 text-center">
          <h1 className="font-serif text-3xl">Piece not found</h1>
          <Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link>
        </div>
      </SiteShell>
    );
  }

  const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const hero = images[activeImg]?.url ?? primaryImage(product);

  const addToCart = async (then?: "cart") => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: user.id, product_id: product.id, quantity: qty, size, color: "As shown" },
      { onConflict: "user_id,product_id,size,color" },
    );
    if (error) {
      toast.error("Could not add to cart.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["cart"] });
    toast.success("Added to your cart.");
    if (then === "cart") navigate({ to: "/cart" });
  };

  const addWishlist = async () => {
    if (!user) {
      toast.error("Please log in to save items.");
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, product_id: product.id });
    if (error && !error.message.includes("duplicate")) {
      toast.error("Could not save item.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["wishlist"] });
    toast.success("Saved to your wishlist.");
  };

  const relatedItems = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-12 md:py-16">
        <nav className="mb-8 text-xs uppercase tracking-widest text-muted-warm">
          <Link to="/shop" className="hover:text-ink">Shop</Link> / <span>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <figure className="overflow-hidden rounded-[12px] bg-secondary">
              {hero && <img src={hero} alt={product.name} className="aspect-[4/5] w-full object-cover" />}
            </figure>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)} className={`overflow-hidden rounded-md border ${i === activeImg ? "border-ink" : "border-transparent"}`}>
                    <img src={img.url} alt="" className="size-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.collections?.name && (
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-warm">{product.collections.name}</p>
            )}
            <h1 className="font-serif text-4xl font-medium md:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-medium">{formatNaira(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-muted-warm line-through">{formatNaira(product.compare_at_price)}</span>
              )}
            </div>
            <p className="mt-6 max-w-[52ch] text-pretty leading-relaxed text-muted-warm">{product.description}</p>

            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.2em]">Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`size-11 rounded-full border text-sm transition-colors ${size === s ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-4 rounded-full border border-ink/20 px-4 py-2">
                <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="size-4" /></button>
                <span className="w-6 text-center">{qty}</span>
                <button aria-label="Increase" onClick={() => setQty((q) => q + 1)}><Plus className="size-4" /></button>
              </div>
              <span className="text-sm text-muted-warm">{product.stock > 0 ? "In stock" : "Made to order"}</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => addToCart()} className="flex-1 rounded-full border border-ink py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-canvas">
                Add to Cart
              </button>
              <button onClick={() => addToCart("cart")} className="flex-1 rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas transition-transform hover:scale-[1.02]">
                Buy Now
              </button>
              <button onClick={addWishlist} aria-label="Add to wishlist" className="grid size-14 shrink-0 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-secondary">
                <Heart className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <ReviewsSection productId={product.id} />

        {relatedItems.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 font-serif text-3xl font-medium">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
              {relatedItems.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(3).max(1000),
});

function ReviewsSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery(reviewsQuery(productId));
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to write a review.");
      return;
    }
    const parsed = reviewSchema.safeParse({ rating, title, body });
    if (!parsed.success) {
      toast.error("Please write at least a few words.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      author_name: user.user_metadata?.full_name ?? user.email,
      rating,
      title: title || null,
      body,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit review.");
      return;
    }
    setTitle("");
    setBody("");
    setRating(5);
    qc.invalidateQueries({ queryKey: ["reviews", productId] });
    toast.success("Thank you! Your review is awaiting approval.");
  };

  return (
    <section className="mt-20 border-t border-ink/10 pt-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="mb-2 font-serif text-3xl font-medium">Customer Reviews</h2>
          <div className="mb-8 flex items-center gap-3">
            <StarRating value={avg} />
            <span className="text-sm text-muted-warm">
              {reviews.length ? `${avg.toFixed(1)} · ${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No reviews yet"}
            </span>
          </div>
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-ink/10 pb-6">
                <StarRating value={r.rating} size={14} />
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-muted-warm">{r.body}</p>
                <p className="mt-2 text-xs text-muted-warm">— {r.author_name ?? "Verified customer"}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 font-serif text-2xl">Write a Review</h3>
          {user ? (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <p className="mb-2 text-sm">Your rating</p>
                <StarRating value={rating} size={24} onChange={setRating} />
              </div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full border-b border-ink/20 bg-transparent py-3 outline-none focus:border-ink" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Share your experience…" className="w-full border-b border-ink/20 bg-transparent py-3 outline-none focus:border-ink" />
              <button disabled={submitting} className="rounded-full bg-ink px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          ) : (
            <p className="text-muted-warm">
              Please <Link to="/auth" className="underline">log in</Link> to write a review.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}