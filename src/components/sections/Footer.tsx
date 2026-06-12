import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-ink px-6 py-12 text-canvas md:px-12">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-canvas/60 md:flex-row">
        <span className="font-serif text-lg normal-case tracking-tight text-canvas">{site.brand}</span>
        <span>© {new Date().getFullYear()} {site.brand} Studio. All rights reserved.</span>
        <div className="flex gap-8">
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-canvas">
            Instagram
          </a>
          <a href={`mailto:${site.email}`} className="hover:text-canvas">
            Journal
          </a>
          <a href="#top" className="hover:text-canvas">
            Top
          </a>
        </div>
      </div>
    </footer>
  );
}