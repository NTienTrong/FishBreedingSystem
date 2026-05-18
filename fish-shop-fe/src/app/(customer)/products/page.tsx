import Link from "next/link";
import ProductsGridClient from "@/components/customer/products/ProductsGridClient";
import { API_URL } from "@/app/config/api";
import { CategoryResponse } from "@/types/category";
import { ProductResponse } from "@/types/product";

type ProductsPageProps = {
  searchParams?: Promise<{ category?: string; search?: string }>;
};

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
  const searchQuery = resolvedSearchParams?.search?.trim().toLowerCase() || "";

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const selectedCategoryId = categories.find((category) => category.slug === selectedCategorySlug)?.id;

  const topLevelCategories = categories.filter((category) => category.isActive);
  let filteredProducts = selectedCategorySlug
    ? products.filter((product) =>
        selectedCategoryId ? product.categories.some((cat) => cat.id === selectedCategoryId) : false
      )
    : products;

  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const sku = (product.sku || "").toLowerCase();
      const slug = (product.slug || "").toLowerCase();
      const desc = (product.description || "").toLowerCase();
      return (
        name.includes(searchQuery) || sku.includes(searchQuery) || slug.includes(searchQuery) || desc.includes(searchQuery)
      );
    });
  }

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
            <ProductsGridClient products={sortedProducts} />
          )}
        </div>
      </div>
    </main>
  );
}
