import Link from "next/link";
import ProductsGridClient from "@/components/customer/products/ProductsGridClient";
import { API_URL } from "@/app/config/api";
import { CategoryResponse } from "@/types/category";
import { ProductResponse } from "@/types/product";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    price?: string | string[];
  }>;
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
  const sortKey = resolvedSearchParams?.sort || "newest";
  const priceParam = resolvedSearchParams?.price;
  const selectedPriceFilters = new Set(
    Array.isArray(priceParam)
      ? priceParam
      : priceParam
        ? priceParam.split(",").filter(Boolean)
        : []
  );

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

  const priceRanges = [
    { id: "lt100", label: "Dưới 100.000đ", min: 0, max: 100000 },
    { id: "100-500", label: "100.000đ - 500.000đ", min: 100000, max: 500000 },
    { id: "500-1000", label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
    { id: "gt1000", label: "Trên 1.000.000đ", min: 1000000, max: null },
  ];

  if (selectedPriceFilters.size > 0) {
    filteredProducts = filteredProducts.filter((product) => {
      return priceRanges.some((range) => {
        if (!selectedPriceFilters.has(range.id)) {
          return false;
        }
        if (range.max === null) {
          return product.price >= range.min;
        }
        return product.price >= range.min && product.price < range.max;
      });
    });
  }

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortKey === "price-asc") {
      return a.price - b.price;
    }
    if (sortKey === "price-desc") {
      return b.price - a.price;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const selectedCategoryName =
    categories.find((category) => category.slug === selectedCategorySlug)?.name || "Tất cả";

  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      <section className="mb-10">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-primary mb-3">
          Danh Sách Sản Phẩm
        </h1>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-72 space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm space-y-4">
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
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-extrabold text-primary">Bộ lọc</h2>
              {selectedPriceFilters.size > 0 && (
                <Link
                  href={`/products${selectedCategorySlug ? `?category=${selectedCategorySlug}` : ""}${
                    selectedCategorySlug && searchQuery ? "&" : !selectedCategorySlug && searchQuery ? "?" : ""
                  }${searchQuery ? `search=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Xóa lọc
                </Link>
              )}
            </div>

            <form className="space-y-4" action="/products" method="get">
              {selectedCategorySlug && (
                <input type="hidden" name="category" value={selectedCategorySlug} />
              )}
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
              <input type="hidden" name="sort" value={sortKey} />

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Lọc theo giá</p>
                {priceRanges.map((range) => (
                  <label key={range.id} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <input
                      type="checkbox"
                      name="price"
                      value={range.id}
                      defaultChecked={selectedPriceFilters.has(range.id)}
                      className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30"
                    />
                    {range.label}
                  </label>
                ))}
              </div>

              <button
                className="w-full rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-container transition-colors"
                type="submit"
              >
                Áp dụng lọc
              </button>
            </form>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-on-surface-variant">
              Danh mục đang chọn: <span className="font-bold text-primary">{selectedCategoryName}</span>. Tổng sản phẩm: {" "}
              <span className="font-bold text-primary">{sortedProducts.length}</span>.
            </div>
            <form className="flex items-center gap-2" action="/products" method="get">
              {selectedCategorySlug && (
                <input type="hidden" name="category" value={selectedCategorySlug} />
              )}
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
              {Array.from(selectedPriceFilters).map((value) => (
                <input key={value} type="hidden" name="price" value={value} />
              ))}
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sắp xếp</label>
              <select
                name="sort"
                defaultValue={sortKey}
                className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
              <button
                className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-bold text-primary hover:bg-surface-container-highest"
                type="submit"
              >
                Áp dụng
              </button>
            </form>
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
