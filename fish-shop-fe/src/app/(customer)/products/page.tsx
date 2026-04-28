import Link from "next/link";
import { API_URL } from "@/app/config/api";
import { CategoryResponse } from "@/types/category";
import { ProductResponse } from "@/types/product";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const FALLBACK_PRODUCT_IMAGE = "https://via.placeholder.com/640x480?text=No+Image";

type ProductsPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

function getMainImage(product: ProductResponse): string {
  return (
    product.images.find((image) => image.isMain)?.imageUrl ||
    product.images[0]?.imageUrl ||
    FALLBACK_PRODUCT_IMAGE
  );
}

async function getProducts(): Promise<ProductResponse[]> {
  const res = await fetch(`${API_URL}/api/public/products`, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as ProductResponse[];
  return data.filter((item) => item.isActive);
}

async function getCategories(): Promise<CategoryResponse[]> {
  const res = await fetch(`${API_URL}/api/public/categories`, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }

  return (await res.json()) as CategoryResponse[];
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedCategorySlug = resolvedSearchParams?.category;

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const selectedCategoryId = categories.find((category) => category.slug === selectedCategorySlug)?.id;

  const topLevelCategories = categories.filter((category) => category.parentId === null);
  const filteredProducts = selectedCategorySlug
    ? products.filter((product) =>
        selectedCategoryId
          ? product.categories.some((cat) => cat.id === selectedCategoryId)
          : false
      )
    : products;

  const sortedProducts = filteredProducts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const selectedCategoryName =
    categories.find((category) => category.slug === selectedCategorySlug)?.name || "Tất cả";

  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      <section className="mb-10">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-primary mb-3">
          Danh Sách Sản Phẩm
        </h1>
        <p className="text-on-surface-variant">
          Hiển thị dữ liệu thật từ database theo các trường sản phẩm: tên, SKU, danh mục, giá,
          tồn kho và mô tả ngắn.
        </p>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-4">
          <h2 className="font-headline font-extrabold text-primary">Danh mục</h2>
          <Link
            href="/products"
            className={`block px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              !selectedCategorySlug
                ? "bg-primary text-white"
                : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Tất cả
          </Link>
          {topLevelCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`block px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                selectedCategorySlug === category.slug
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </aside>

        <div className="flex-1">
          <div className="mb-6 text-sm text-on-surface-variant">
            Danh mục đang chọn: <span className="font-bold text-primary">{selectedCategoryName}</span>.
            Tổng sản phẩm: <span className="font-bold text-primary">{sortedProducts.length}</span>.
          </div>

          {sortedProducts.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
              Chưa có sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.id} className="group">
                  <div className="aspect-4/3 bg-surface-container-low rounded-2xl overflow-hidden mb-4">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={getMainImage(product)}
                      alt={product.name}
                    />
                  </div>

                  <div className="space-y-2 px-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-headline font-extrabold text-primary leading-tight group-hover:text-secondary transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-[10px] text-outline font-bold bg-surface-container-high px-2 py-1 rounded uppercase">
                        {product.sku || "No SKU"}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant">
                      Danh mục: {product.categories.map((cat) => cat.name).join(", ") || "Chưa phân loại"}
                    </p>

                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      {product.summary || product.description || "Đang cập nhật mô tả."}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-black text-primary">
                        {currency.format(product.price)}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          product.stockQuantity > 0
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {product.stockQuantity > 0
                          ? `Còn ${product.stockQuantity}`
                          : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
