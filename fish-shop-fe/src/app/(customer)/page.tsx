import Link from "next/link";
import { API_URL } from "@/app/config/api";
import { CategoryResponse } from "@/types/category";
import { ProductResponse } from "@/types/product";
import { BlogPostResponse } from "@/types/blog";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function stripHtml(content: string): string {
  return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchCategories(): Promise<CategoryResponse[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as CategoryResponse[];
  } catch {
    return [];
  }
}

async function fetchProducts(): Promise<ProductResponse[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as ProductResponse[];
  } catch {
    return [];
  }
}

async function fetchBlogPosts(): Promise<BlogPostResponse[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/blog`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as BlogPostResponse[];
  } catch {
    return [];
  }
}

function getMainImage(product: ProductResponse): string {
  return (
    product.images.find((image) => image.isMain)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "https://via.placeholder.com/640x480?text=No+Image"
  );
}

export default async function Home() {
  const [categories, products, blogPosts] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchBlogPosts(),
  ]);

  const topCategories = categories.filter((category) => category.isActive);
  const featuredProducts = products
    .filter((product) => product.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const latestBlogPosts = blogPosts
    .filter((post) => post.isPublished)
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())
    .slice(0, 3);

  return (
    <main className="relative px-6 pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-72 w-190 -translate-x-1/2 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute top-40 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <section className="max-w-7xl mx-auto pt-10 pb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
          <img
            src="https://images.unsplash.com/photo-1524704796725-9fc3044fbb92?auto=format&fit=crop&w=1600&q=80"
            alt="Banner cá cảnh"
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-black/20" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-3xl text-white">
              <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.28em]">
                <span className="text-white/90">FishSync</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight">Nuôi cá không khó — Chỉ cần giống tốt và kỹ thuật đúng</h1>
              <p className="mt-4 text-sm md:text-lg text-white/80">Nhà cung cấp hơn 60 giống cá nước ngọt, cam kết giống chuẩn và hỗ trợ kỹ thuật trước — trong — sau nuôi.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">
                  Xem sản phẩm
                </Link>
                <a href="tel:0769999295" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-3 text-sm font-semibold text-white/90">
                  076 999 9295
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {topCategories.length > 0 ? (
        <section id="danh-muc" className="max-w-7xl mx-auto py-10">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black font-headline text-primary">Danh mục nổi bật</h2>
              <p className="mt-2 text-on-surface-variant">Chọn nhanh danh mục phù hợp với bạn.</p>
            </div>
            <Link href="/products" className="text-primary font-bold hover:underline flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-5">
            {topCategories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group rounded-3xl overflow-hidden bg-surface-container-low border border-surface-container-high hover:shadow-xl transition-all"
              >
                <div className="aspect-square bg-surface-container-highest overflow-hidden">
                  <img
                    alt={category.name}
                    src={category.imageUrl || "https://via.placeholder.com/300?text=No+Image"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <div className="font-bold text-primary leading-snug">{category.name}</div>
                  <div className="mt-1 text-xs text-on-surface-variant line-clamp-2">
                    {category.description || "Chưa có mô tả danh mục."}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {featuredProducts.length > 0 ? (
        <section id="san-pham-noi-bat" className="bg-surface-container-low py-16 mt-8">
          <div className="max-w-7xl mx-auto px-0">
            <div className="flex items-end justify-between gap-6 mb-8 px-6">
              <div>
                <h2 className="text-3xl font-black font-headline text-primary">Sản phẩm nổi bật</h2>
                <p className="mt-2 text-on-surface-variant">Đề xuất dựa trên các sản phẩm mới nhất.</p>
              </div>
              <Link href="/products" className="text-primary font-bold hover:underline flex items-center gap-1">
                Xem tất cả <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="rounded-[1.75rem] overflow-hidden bg-surface-container-lowest border border-surface-container-high shadow-sm hover:shadow-2xl transition-all"
                >
                  <div className="aspect-4/3 overflow-hidden bg-surface-container-high">
                    <img
                      alt={product.name}
                      src={getMainImage(product)}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-headline font-black text-primary leading-tight line-clamp-2">{product.name}</h3>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest bg-surface-container-high px-2 py-1 rounded-full text-outline">
                        {product.sku || "Không có SKU"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-on-surface-variant line-clamp-2">
                      {product.summary || product.description || "Đang cập nhật thông tin sản phẩm."}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-2xl font-black text-secondary">{currency.format(product.price)}</span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container">
                        {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {latestBlogPosts.length > 0 ? (
        <section id="blog" className="max-w-7xl mx-auto py-16">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black font-headline text-primary">Blog kỹ thuật</h2>
              <p className="mt-2 text-on-surface-variant">Cập nhật bài viết và hướng dẫn mới nhất.</p>
            </div>
            <Link href="/blog" className="text-primary font-bold hover:underline flex items-center gap-1">
              Tất cả bài viết <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-[1.75rem] overflow-hidden bg-surface-container-low border border-surface-container-high hover:shadow-xl transition-all"
              >
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
                  <h3 className="font-headline text-xl font-black text-primary leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant line-clamp-3">
                    {stripHtml(post.content).slice(0, 160) || "Chưa có mô tả bài viết."}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
                    Xem bài viết <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {topCategories.length === 0 && featuredProducts.length === 0 && latestBlogPosts.length === 0 ? (
        <section className="max-w-7xl mx-auto py-20 text-center text-on-surface-variant">
          Hiện chưa có dữ liệu nào để hiển thị.
        </section>
      ) : null}
    </main>
  );
}
