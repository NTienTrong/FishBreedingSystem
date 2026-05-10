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

  const topCategories = categories.filter((category) => category.parentId === null);
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
        <div className="absolute -top-28 left-1/2 h-72 w-[760px] -translate-x-1/2 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute top-40 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <section className="max-w-7xl mx-auto pt-10 pb-12">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-stretch">
          <div className="rounded-[2.5rem] bg-surface-container-lowest border border-surface-container-high p-8 lg:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.06)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-secondary">
              Dashboard khách hàng
            </div>
            <h1 className="mt-6 text-4xl lg:text-6xl font-black tracking-tight text-primary font-headline leading-tight">
              Trung tâm mua sắm và quản lý cá cảnh
            </h1>
            <p className="mt-5 max-w-2xl text-base lg:text-lg text-on-surface-variant leading-relaxed">
              Tổng hợp danh mục, sản phẩm và bài viết mới nhất từ hệ thống. Thông tin sẽ tự động ẩn khi chưa có dữ liệu.
            </p>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Danh mục", value: categories.length },
                { label: "Danh mục gốc", value: topCategories.length },
                { label: "Sản phẩm", value: products.length },
                { label: "Bài viết", value: latestBlogPosts.length > 0 ? latestBlogPosts.length : blogPosts.length },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/80 px-4 py-5 border border-surface-container-high">
                  <div className="text-3xl font-black text-primary">{item.value}</div>
                  <div className="mt-1 text-sm font-semibold text-on-surface-variant">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "Khám phá sản phẩm", href: "/products" },
                { label: "Mở giỏ hàng", href: "/cart" },
                { label: "Hồ sơ cá nhân", href: "/profile" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-5 py-2 text-sm font-bold text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  {item.label}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] bg-gradient-to-br from-primary via-primary to-secondary text-white p-6 lg:p-8 shadow-[0_24px_60px_rgba(0,66,83,0.25)]">
              <div className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">
                Tổng quan nhanh
              </div>
              <h2 className="mt-4 text-2xl lg:text-3xl font-black font-headline">
                Sản phẩm mới và bài viết đang được cập nhật liên tục
              </h2>
              <p className="mt-3 text-sm lg:text-base text-white/80 leading-relaxed">
                Theo dõi xu hướng, đơn hàng gần đây và các gợi ý từ hệ thống của bạn.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-4 py-2 text-sm font-bold"
                >
                  Xem sản phẩm hot
                  <span className="material-symbols-outlined text-base">local_fire_department</span>
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition-all"
                >
                  Đọc bài viết mới
                  <span className="material-symbols-outlined text-base">auto_stories</span>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { title: "Xem sản phẩm", desc: "Khám phá toàn bộ sản phẩm đang bán", href: "/products", icon: "storefront" },
                { title: "Giỏ hàng", desc: "Kiểm tra các món đang chờ thanh toán", href: "/cart", icon: "shopping_cart" },
                { title: "Đơn hàng", desc: "Theo dõi lịch sử mua hàng", href: "/profile", icon: "receipt_long" },
                { title: "Bài viết mới", desc: "Xem blog và hướng dẫn kỹ thuật", href: "/blog", icon: "article" },
              ].map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="rounded-3xl bg-surface-container-low p-5 border border-surface-container-high hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                      <span className="material-symbols-outlined">{action.icon}</span>
                    </div>
                    <div>
                      <div className="font-bold text-primary">{action.title}</div>
                      <div className="mt-1 text-sm text-on-surface-variant leading-relaxed">{action.desc}</div>
                    </div>
                  </div>
                </Link>
              ))}
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
