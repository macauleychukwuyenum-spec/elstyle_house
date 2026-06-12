import { Link } from "@tanstack/react-router";
import { site } from "@/lib/site";

const shop = [
  { label: "Shop All", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "Custom Orders", to: "/custom-orders" },
] as const;

const company = [
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

const policies = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "FAQ", to: "/faq" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Return Policy", to: "/return-policy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-ink px-6 py-16 text-canvas md:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-serif text-2xl">{site.brand}</span>
            <p className="mt-4 max-w-[28ch] text-sm text-canvas/70">{site.tagline}.</p>
            <p className="mt-4 text-sm text-canvas/70">{site.address}</p>
          </div>
          <FooterCol title="Shop" items={shop} />
          <FooterCol title="Company" items={company} />
          <FooterCol title="Policies" items={policies} />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-canvas/15 pt-8 text-[11px] uppercase tracking-widest text-canvas/60 md:flex-row">
          <span>© {new Date().getFullYear()} {site.brand}. All rights reserved.</span>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-canvas">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: readonly { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-[11px] uppercase tracking-[0.3em] text-canvas/50">{title}</h4>
      <ul className="space-y-3 text-sm text-canvas/80">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="transition-colors hover:text-canvas">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}