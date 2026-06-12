import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { blogQuery } from "@/lib/catalog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Journal — EL STYLE HOUSE" },
      { name: "description", content: "Fashion tips, style guides, trends and news from EL STYLE HOUSE." },
      { property: "og:title", content: "Journal — EL STYLE HOUSE" },
      { property: "og:description", content: "Fashion tips, style guides and news from EL STYLE HOUSE." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { data: posts = [] } = useQuery(blogQuery());
  const [q, setQ] = useState("");
  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      (p.excerpt ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-16">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-5xl font-medium md:text-6xl">The Journal</h1>
          <p className="mt-3 text-muted-warm">Style guides, fashion tips and stories from the house.</p>
        </header>
        <div className="relative mx-auto mb-12 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-warm" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the journal…" className="w-full rounded-full border border-ink/15 bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ink" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group block">
              <figure className="overflow-hidden rounded-[10px] bg-secondary">
                {p.cover_url && <img src={p.cover_url} alt={p.title} loading="lazy" className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
              </figure>
              {p.category && <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-muted-warm">{p.category}</p>}
              <h2 className="mt-2 font-serif text-2xl leading-tight">{p.title}</h2>
              {p.excerpt && <p className="mt-2 text-sm text-muted-warm line-clamp-2">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <p className="py-16 text-center text-muted-warm">No articles found.</p>}
      </div>
    </SiteShell>
  );
}