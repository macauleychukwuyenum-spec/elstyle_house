import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

const links = [
  { label: "Collections", href: "#works" },
  { label: "Atelier", href: "#about" },
  { label: "Editorial", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-500 ${
        scrolled
          ? "bg-canvas/85 text-ink backdrop-blur-md border-b border-ink/10"
          : "bg-transparent text-canvas"
      }`}
    >
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12">
        <a href="#top" className="font-serif text-2xl font-medium tracking-tight">
          {site.brand}
        </a>

        <div className="hidden gap-10 text-xs font-medium uppercase tracking-[0.2em] md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-opacity duration-300 hover:opacity-60">
              {l.label}
            </a>
          ))}
        </div>

        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest ring-1 ring-current transition-colors duration-300 hover:bg-current hover:text-canvas md:inline-block"
        >
          Enquire
        </a>

        <button
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-canvas px-6 py-8 text-ink md:hidden">
          <div className="flex flex-col gap-6 text-sm font-medium uppercase tracking-[0.2em]">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded-full bg-ink px-5 py-3 text-center text-canvas"
              onClick={() => setOpen(false)}
            >
              Enquire via WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}