import { Link } from "@tanstack/react-router";
import { type Product, primaryImage } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const img = primaryImage(product);
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group block">
      <figure className="relative overflow-hidden rounded-[10px] bg-secondary">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="aspect-[4/5] w-full" />
        )}
        {product.is_new_arrival && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[10px] uppercase tracking-widest text-canvas">
            New
          </span>
        )}
      </figure>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg leading-tight">{product.name}</h3>
          {product.collections?.name && (
            <p className="text-xs text-muted-warm">{product.collections.name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{formatNaira(product.price)}</p>
          {product.compare_at_price && (
            <p className="text-xs text-muted-warm line-through">
              {formatNaira(product.compare_at_price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}