import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, User, ShoppingBag, Heart } from "lucide-react";
import { site } from "@/lib/site";
import { useAuth } from "@/lib/auth";

const links = [
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "Custom Orders", to: "/custom-orders" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink/10 bg-canvas/90 text-ink backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-12">
        <Link to="/" className="font-serif text-xl font-medium tracking-tight md:text-2xl">
          {site.brand}
        </Link>

        <div className="hidden gap-8 text-[11px] font-medium uppercase tracking-[0.2em] lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "opacity-100" }}
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/wishlist" aria-label="Wishlist" className="hidden opacity-70 transition-opacity hover:opacity-100 sm:block">
            <Heart className="size-5" />
          </Link>
          <Link to="/cart" aria-label="Cart" className="opacity-70 transition-opacity hover:opacity-100">
            <ShoppingBag className="size-5" />
          </Link>
          <Link
            to={user ? "/account" : "/auth"}
            aria-label="Account"
            className="opacity-70 transition-opacity hover:opacity-100"
          >
            <User className="size-5" />
          </Link>
          <button aria-label="Toggle menu" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-canvas px-5 py-6 lg:hidden">
          <div className="flex flex-col gap-5 text-sm font-medium uppercase tracking-[0.2em]">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link to={user ? "/account" : "/auth"} onClick={() => setOpen(false)}>
              {user ? "My Account" : "Login / Register"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}