import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X, User, ShoppingBag, Heart } from "lucide-react";
import { site } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { fabricsCategory, shopMenuSections } from "@/lib/navigation";

const links = [
  { label: "HOME", to: "/" },
  { label: "COLLECTIONS", to: "/collections" },
  { label: "FABRICS", to: "/shop", search: { category: fabricsCategory.slug } },
  { label: "ABOUT", to: "/about" },
  { label: "CONTACT", to: "/contact" },
] as const;
const leadingLinks = links.slice(0, 2);
const trailingLinks = links.slice(2);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink/10 bg-canvas/90 text-ink backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-12">
        <Link to="/" className="font-serif text-xl font-medium tracking-tight md:text-2xl">
          {site.brand}
        </Link>

        <div className="hidden items-center gap-7 text-[11px] font-medium uppercase tracking-[0.2em] lg:flex">
          {leadingLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              search={"search" in l ? l.search : undefined}
              activeProps={{ className: "opacity-100" }}
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              {l.label}
            </Link>
          ))}
          {shopMenuSections.map((section) => (
            <div key={section.label} className="group relative">
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-1 opacity-70 transition-opacity hover:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100"
              >
                {section.label}
                <ChevronDown className="size-3" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="rounded-md border border-ink/10 bg-canvas p-2 text-[11px] shadow-xl">
                  {section.items.map((item) => (
                    <Link
                      key={item.slug}
                      to="/shop"
                      search={{ category: item.slug }}
                      className="block rounded-md px-3 py-2 tracking-[0.16em] opacity-70 transition hover:bg-secondary hover:opacity-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {trailingLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              search={"search" in l ? l.search : undefined}
              activeProps={{ className: "opacity-100" }}
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={user ? "/account" : "/auth"}
            className="opacity-70 transition-opacity hover:opacity-100"
          >
            {user ? "ACCOUNT" : "LOGIN / REGISTER"}
          </Link>
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
            {leadingLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={"search" in l ? l.search : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {shopMenuSections.map((section) => (
              <div key={section.label} className="space-y-3">
                <p>{section.label}</p>
                <div className="flex flex-col gap-3 border-l border-ink/15 pl-4 text-xs tracking-[0.18em] text-muted-warm">
                  {section.items.map((item) => (
                    <Link
                      key={item.slug}
                      to="/shop"
                      search={{ category: item.slug }}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {trailingLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={"search" in l ? l.search : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link to={user ? "/account" : "/auth"} onClick={() => setOpen(false)}>
              {user ? "ACCOUNT" : "LOGIN / REGISTER"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
