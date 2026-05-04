import Link from "next/link";
import { API_URL } from "@/app/config/api";
import { BlogPostResponse } from "@/types/blog";

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function stripHtml(content: string): string {
  return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function getBlogPosts(): Promise<BlogPostResponse[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/blog`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }

    return (await res.json()) as BlogPostResponse[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const blogPosts = (await getBlogPosts())
    .filter((post) => post.isPublished)
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime());

  return (
    <main className="px-6 pb-24 max-w-7xl mx-auto">
      <section className="pt-10 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-secondary">
          Blog công khai
        </div>
        <h1 className="mt-6 text-4xl lg:text-6xl font-black tracking-tight text-primary font-headline leading-tight">
          Bài viết kỹ thuật từ hệ thống
        </h1>
        <p className="mt-4 max-w-3xl text-on-surface-variant leading-relaxed">
          Danh sách bài viết được lấy trực tiếp từ cơ sở dữ liệu. Chỉ các bài đã xuất bản mới hiển thị.
        </p>
      </section>

      {blogPosts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article key={post.id} className="rounded-[1.75rem] overflow-hidden bg-surface-container-low border border-surface-container-high hover:shadow-xl transition-all">
              <div className="aspect-video bg-surface-container-high overflow-hidden">
                <img
                  alt={post.title}
                  src={post.thumbnailUrl || "https://via.placeholder.com/800x450?text=Blog"}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.3em] text-secondary">
                  <span>{post.authorFullName || post.authorUsername || "Tác giả"}</span>
                  <span>{dateFormat.format(new Date(post.publishedAt || post.createdAt))}</span>
                </div>
                <h2 className="font-headline text-2xl font-black text-primary leading-tight">
                  {post.title}
                </h2>
                <p className="text-sm text-on-surface-variant line-clamp-4">
                  {stripHtml(post.content).slice(0, 220) || "Chưa có mô tả bài viết."}
                </p>
                <div className="pt-2">
                  <Link href="/" className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
                    Quay lại trang chủ <span className="material-symbols-outlined text-sm">arrow_back</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
          Hiện chưa có bài viết nào.
        </div>
      )}
    </main>
  );
}
