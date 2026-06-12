import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { blogPostQuery } from "@/lib/catalog";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — EL STYLE HOUSE Journal` },
      { name: "description", content: "Read this article from the EL STYLE HOUSE journal." },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery(blogPostQuery(slug));

  if (isLoading) return <SiteShell><p className="py-32 text-center text-muted-warm">Loading…</p></SiteShell>;
  if (!post) {
    return (
      <SiteShell>
        <div className="py-32 text-center">
          <h1 className="font-serif text-3xl">Article not found</h1>
          <Link to="/blog" className="mt-4 inline-block underline">Back to journal</Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <article className="mx-auto max-w-[760px] px-6 py-12 md:py-20">
        <Link to="/blog" className="text-xs uppercase tracking-widest text-muted-warm hover:text-ink">← Journal</Link>
        {post.category && <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-warm">{post.category}</p>}
        <h1 className="mt-3 font-serif text-4xl font-medium leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-warm">By {post.author ?? "EL STYLE HOUSE"}</p>
        {post.cover_url && <img src={post.cover_url} alt={post.title} className="mt-8 w-full rounded-[12px] object-cover" />}
        <div className="mt-8 whitespace-pre-line text-pretty leading-relaxed text-ink/90">{post.body}</div>
      </article>
    </SiteShell>
  );
}