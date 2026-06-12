import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Minus, Plus, Heart } from "lucide-react";
import { z } from "zod";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { P as ProductCard } from "./ProductCard-BeeKo7U2.js";
import { d as productQuery, p as productsQuery, e as primaryImage, r as reviewsQuery } from "./catalog-Cy6bWRG4.js";
import { f as formatNaira } from "./format-DildIsQ0.js";
import { R as Route, u as useAuth } from "./router-x3seCsFL.js";
import { s as supabase } from "./client-BC8ib9gb.js";
import "./client.server-U_pH-Evd.js";
import "@supabase/supabase-js";
function StarRating({
  value,
  size = 16,
  onChange
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: [1, 2, 3, 4, 5].map((i) => {
    const filled = i <= Math.round(value);
    const star = /* @__PURE__ */ jsx(
      Star,
      {
        style: { width: size, height: size },
        className: filled ? "fill-accent text-accent" : "text-ink/25"
      }
    );
    return onChange ? /* @__PURE__ */ jsx("button", { type: "button", "aria-label": `${i} star`, onClick: () => onChange(i), children: star }, i) : /* @__PURE__ */ jsx("span", { children: star }, i);
  }) });
}
const SIZES = ["XS", "S", "M", "L", "XL"];
function ProductPage() {
  const {
    slug
  } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    user
  } = useAuth();
  const {
    data: product,
    isLoading
  } = useQuery(productQuery(slug));
  const {
    data: related = []
  } = useQuery(productsQuery({}));
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  if (isLoading) {
    return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsx("p", { className: "py-32 text-center text-muted-warm", children: "Loading…" }) });
  }
  if (!product) {
    return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "py-32 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-3xl", children: "Piece not found" }),
      /* @__PURE__ */ jsx(Link, { to: "/shop", className: "mt-4 inline-block underline", children: "Back to shop" })
    ] }) });
  }
  const images = [...product.product_images ?? []].sort((a, b) => a.sort_order - b.sort_order);
  const hero = images[activeImg]?.url ?? primaryImage(product);
  const addToCart = async (then) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      navigate({
        to: "/auth"
      });
      return;
    }
    const {
      error
    } = await supabase.from("cart_items").upsert({
      user_id: user.id,
      product_id: product.id,
      quantity: qty,
      size,
      color: "As shown"
    }, {
      onConflict: "user_id,product_id,size,color"
    });
    if (error) {
      toast.error("Could not add to cart.");
      return;
    }
    qc.invalidateQueries({
      queryKey: ["cart"]
    });
    toast.success("Added to your cart.");
    if (then === "cart") navigate({
      to: "/cart"
    });
  };
  const addWishlist = async () => {
    if (!user) {
      toast.error("Please log in to save items.");
      navigate({
        to: "/auth"
      });
      return;
    }
    const {
      error
    } = await supabase.from("wishlists").insert({
      user_id: user.id,
      product_id: product.id
    });
    if (error && !error.message.includes("duplicate")) {
      toast.error("Could not save item.");
      return;
    }
    qc.invalidateQueries({
      queryKey: ["wishlist"]
    });
    toast.success("Saved to your wishlist.");
  };
  const relatedItems = related.filter((p) => p.id !== product.id).slice(0, 4);
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] px-6 py-10 md:px-12 md:py-16", children: [
    /* @__PURE__ */ jsxs("nav", { className: "mb-8 text-xs uppercase tracking-widest text-muted-warm", children: [
      /* @__PURE__ */ jsx(Link, { to: "/shop", className: "hover:text-ink", children: "Shop" }),
      " / ",
      /* @__PURE__ */ jsx("span", { children: product.name })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("figure", { className: "overflow-hidden rounded-[12px] bg-secondary", children: hero && /* @__PURE__ */ jsx("img", { src: hero, alt: product.name, className: "aspect-[4/5] w-full object-cover" }) }),
        images.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex gap-3", children: images.map((img, i) => /* @__PURE__ */ jsx("button", { onClick: () => setActiveImg(i), className: `overflow-hidden rounded-md border ${i === activeImg ? "border-ink" : "border-transparent"}`, children: /* @__PURE__ */ jsx("img", { src: img.url, alt: "", className: "size-20 object-cover" }) }, img.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        product.collections?.name && /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs uppercase tracking-[0.3em] text-muted-warm", children: product.collections.name }),
        /* @__PURE__ */ jsx("h1", { className: "font-serif text-4xl font-medium md:text-5xl", children: product.name }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-medium", children: formatNaira(product.price) }),
          product.compare_at_price && /* @__PURE__ */ jsx("span", { className: "text-muted-warm line-through", children: formatNaira(product.compare_at_price) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-[52ch] text-pretty leading-relaxed text-muted-warm", children: product.description }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs uppercase tracking-[0.2em]", children: "Size" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: SIZES.map((s) => /* @__PURE__ */ jsx("button", { onClick: () => setSize(s), className: `size-11 rounded-full border text-sm transition-colors ${size === s ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"}`, children: s }, s)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 rounded-full border border-ink/20 px-4 py-2", children: [
            /* @__PURE__ */ jsx("button", { "aria-label": "Decrease", onClick: () => setQty((q) => Math.max(1, q - 1)), children: /* @__PURE__ */ jsx(Minus, { className: "size-4" }) }),
            /* @__PURE__ */ jsx("span", { className: "w-6 text-center", children: qty }),
            /* @__PURE__ */ jsx("button", { "aria-label": "Increase", onClick: () => setQty((q) => q + 1), children: /* @__PURE__ */ jsx(Plus, { className: "size-4" }) })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-warm", children: product.stock > 0 ? "In stock" : "Made to order" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => addToCart(), className: "flex-1 rounded-full border border-ink py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-canvas", children: "Add to Cart" }),
          /* @__PURE__ */ jsx("button", { onClick: () => addToCart("cart"), className: "flex-1 rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas transition-transform hover:scale-[1.02]", children: "Buy Now" }),
          /* @__PURE__ */ jsx("button", { onClick: addWishlist, "aria-label": "Add to wishlist", className: "grid size-14 shrink-0 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-secondary", children: /* @__PURE__ */ jsx(Heart, { className: "size-5" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ReviewsSection, { productId: product.id }),
    relatedItems.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-20", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-8 font-serif text-3xl font-medium", children: "You May Also Like" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8", children: relatedItems.map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p.id)) })
    ] })
  ] }) });
}
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(3).max(1e3)
});
function ReviewsSection({
  productId
}) {
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const {
    data: reviews = []
  } = useQuery(reviewsQuery(productId));
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to write a review.");
      return;
    }
    const parsed = reviewSchema.safeParse({
      rating,
      title,
      body
    });
    if (!parsed.success) {
      toast.error("Please write at least a few words.");
      return;
    }
    setSubmitting(true);
    const {
      error
    } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      author_name: user.user_metadata?.full_name ?? user.email,
      rating,
      title: title || null,
      body
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit review.");
      return;
    }
    setTitle("");
    setBody("");
    setRating(5);
    qc.invalidateQueries({
      queryKey: ["reviews", productId]
    });
    toast.success("Thank you! Your review is awaiting approval.");
  };
  return /* @__PURE__ */ jsx("section", { className: "mt-20 border-t border-ink/10 pt-12", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-12 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-2 font-serif text-3xl font-medium", children: "Customer Reviews" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(StarRating, { value: avg }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-warm", children: reviews.length ? `${avg.toFixed(1)} · ${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No reviews yet" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: reviews.map((r) => /* @__PURE__ */ jsxs("div", { className: "border-b border-ink/10 pb-6", children: [
        /* @__PURE__ */ jsx(StarRating, { value: r.rating, size: 14 }),
        r.title && /* @__PURE__ */ jsx("p", { className: "mt-2 font-medium", children: r.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-warm", children: r.body }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-warm", children: [
          "— ",
          r.author_name ?? "Verified customer"
        ] })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-6 font-serif text-2xl", children: "Write a Review" }),
      user ? /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm", children: "Your rating" }),
          /* @__PURE__ */ jsx(StarRating, { value: rating, size: 24, onChange: setRating })
        ] }),
        /* @__PURE__ */ jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Title (optional)", className: "w-full border-b border-ink/20 bg-transparent py-3 outline-none focus:border-ink" }),
        /* @__PURE__ */ jsx("textarea", { value: body, onChange: (e) => setBody(e.target.value), rows: 4, placeholder: "Share your experience…", className: "w-full border-b border-ink/20 bg-transparent py-3 outline-none focus:border-ink" }),
        /* @__PURE__ */ jsx("button", { disabled: submitting, className: "rounded-full bg-ink px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60", children: submitting ? "Submitting…" : "Submit Review" })
      ] }) : /* @__PURE__ */ jsxs("p", { className: "text-muted-warm", children: [
        "Please ",
        /* @__PURE__ */ jsx(Link, { to: "/auth", className: "underline", children: "log in" }),
        " to write a review."
      ] })
    ] })
  ] }) });
}
export {
  ProductPage as component
};
