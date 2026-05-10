import Link from "next/link";
import { notFound } from "next/navigation";
import { API_URL } from "@/app/config/api";
import { BlogPostResponse } from "@/types/blog";

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

async function getBlogPostBySlug(slug: string): Promise<BlogPostResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/blog/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }

    return (await res.json()) as BlogPostResponse;
  } catch {
    return null;
  }
}

async function getBlogPostById(id: number): Promise<BlogPostResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/blog/id/${id}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }

    return (await res.json()) as BlogPostResponse;
  } catch {
    return null;
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isIdSlug = slug.startsWith("id-");
  const idCandidate = isIdSlug ? Number(slug.slice(3)) : Number.NaN;
  let post = isIdSlug && Number.isFinite(idCandidate)
    ? await getBlogPostById(idCandidate)
    : await getBlogPostBySlug(slug);

  if (!post && !isIdSlug) {
    const numericId = Number(slug);
    if (Number.isFinite(numericId)) {
      post = await getBlogPostById(numericId);
    }
  }

  if (!post) {
    notFound();
  }

  return (
    <main className="px-6 pb-24 max-w-5xl mx-auto">
      <section className="pt-10 pb-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-secondary font-bold hover:underline">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại blog
        </Link>
        <h1 className="mt-6 text-4xl lg:text-5xl font-black tracking-tight text-primary font-headline leading-tight">
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] text-secondary">
          <span>{post.authorFullName || post.authorUsername || "Tác giả"}</span>
          <span>{dateFormat.format(new Date(post.publishedAt || post.createdAt))}</span>
        </div>
      </section>

      <div className="rounded-[1.75rem] overflow-hidden bg-surface-container-low border border-surface-container-high">
        <div className="aspect-video bg-surface-container-high overflow-hidden">
          <img
            alt={post.title}
            src={post.thumbnailUrl || "https://via.placeholder.com/1200x675?text=Blog"}
            className="h-full w-full object-cover"
          />
        </div>
        <article className="p-6 md:p-8 space-y-6 text-on-surface">
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </main>
  );
}
