import Link from "next/link";
import { API_URL } from "@/app/config/api";
import { ProductResponse } from "@/types/product";

const FALLBACK_PRODUCT_IMAGE = "https://via.placeholder.com/640x480?text=No+Image";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getMainImage(product: ProductResponse): string {
  return (
    product.images.find((image) => image.isMain)?.imageUrl ||
    product.images[0]?.imageUrl ||
    FALLBACK_PRODUCT_IMAGE
  );
}

const FeaturedProducts = async () => {
  let products: ProductResponse[] = [];

  try {
    const res = await fetch(`${API_URL}/api/public/products`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as ProductResponse[];
      products = data
        .filter((product) => product.isActive)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);
    }
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
  }

  return (
    <section className="bg-surface-container-low py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl font-black font-headline text-primary tracking-tight">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="h-1 w-24 bg-tertiary-container mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="bg-surface-container-lowest rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-[0_20px_40px_rgba(25,28,30,0.06)] flex flex-col h-full"
            >
              <div className="relative overflow-hidden aspect-4/3">
                <img
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={getMainImage(product)}
                />
                {product.stockQuantity > 0 ? (
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">
                    In stock
                  </div>
                ) : null}
              </div>
              <div className="p-6 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-primary font-headline">
                    {product.name}
                  </h3>
                  <span className="text-[10px] text-outline font-bold bg-surface-container-high px-2 py-1 rounded uppercase">
                    {product.sku || "No SKU"}
                  </span>
                </div>
                <p className="text-sm text-outline-variant mb-6 line-clamp-2">
                  {product.summary || product.description || "Đang cập nhật thông tin sản phẩm."}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-2xl font-black text-secondary">
                    {currency.format(product.price)}
                  </span>
                  <div className="p-3 bg-surface-container-high rounded-full hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined">
                      add_shopping_cart
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {products.length === 0 ? (
          <p className="text-outline text-sm mt-6">Chưa có sản phẩm nổi bật để hiển thị.</p>
        ) : null}
      </div>
    </section>
  );
};

export default FeaturedProducts;
