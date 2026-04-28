import Link from "next/link";
import { notFound } from "next/navigation";
import { API_URL } from "@/app/config/api";
import ProductPurchasePanel from "@/components/customer/cart/ProductPurchasePanel";
import { ProductResponse } from "@/types/product";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const FALLBACK_PRODUCT_IMAGE = "https://via.placeholder.com/640x480?text=No+Image";

type ProductDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

async function getProducts(): Promise<ProductResponse[]> {
  const res = await fetch(`${API_URL}/api/public/products`, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }

  return (await res.json()) as ProductResponse[];
}

function getImages(product: ProductResponse): string[] {
  if (product.images.length === 0) {
    return [FALLBACK_PRODUCT_IMAGE];
  }

  return product.images
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.imageUrl);
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const products = (await getProducts()).filter((product) => product.isActive);

  const product = products.find((item) => item.slug === slug);
  if (!product) {
    notFound();
  }

  const productImages = getImages(product);
  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .filter((item) =>
      item.categories.some((category) => product.categories.some((pCat) => pCat.id === category.id))
    )
    .slice(0, 4);

  return (
    <main className="px-6 max-w-7xl mx-auto pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        <section className="lg:col-span-7">
          <div className="rounded-2xl overflow-hidden bg-surface-container-low aspect-4/3 mb-4">
            <img src={productImages[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {productImages.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {productImages.slice(0, 4).map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className="rounded-xl overflow-hidden bg-surface-container-low aspect-square"
                >
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="lg:col-span-5">
          <span className="inline-flex px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase mb-4">
            {product.stockQuantity > 0 ? "In stock" : "Out of stock"}
          </span>

          <h1 className="text-4xl font-extrabold text-primary mb-2">{product.name}</h1>
          <p className="text-sm text-on-surface-variant mb-1">SKU: {product.sku || "Chưa cập nhật"}</p>
          <p className="text-sm text-on-surface-variant mb-4">
            Danh mục: {product.categories.map((cat) => cat.name).join(", ") || "Chưa phân loại"}
          </p>

          <p className="text-3xl font-black text-primary mb-6">{currency.format(product.price)}</p>

          <div className="rounded-2xl bg-surface-container-low p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Trạng thái</span>
              <span className="font-bold text-primary">{product.isActive ? "Đang bán" : "Ngừng bán"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Số lượng tồn</span>
              <span className="font-bold text-primary">{product.stockQuantity}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Ngày tạo</span>
              <span className="font-bold text-primary">
                {new Date(product.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          <ProductPurchasePanel
            productId={product.id}
            name={product.name}
            sku={product.sku}
            price={product.price}
            imageUrl={productImages[0]}
            stockQuantity={product.stockQuantity}
          />
        </section>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div className="rounded-2xl bg-surface-container-low p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Mô tả sản phẩm</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
            {product.description || product.summary || "Sản phẩm chưa có mô tả chi tiết."}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-container-low p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Thông số kỹ thuật</h2>
          {product.attributeValues.length === 0 ? (
            <p className="text-on-surface-variant">Chưa có thuộc tính kỹ thuật cho sản phẩm này.</p>
          ) : (
            <div className="space-y-3">
              {product.attributeValues.map((attribute) => (
                <div
                  key={`${attribute.attributeId}-${attribute.attributeName}`}
                  className="flex items-center justify-between border-b border-outline-variant/20 pb-2"
                >
                  <span className="text-on-surface-variant">{attribute.attributeName}</span>
                  <span className="font-bold text-primary">{attribute.attrValue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold text-primary mb-8">Sản phẩm liên quan</h2>
        {relatedProducts.length === 0 ? (
          <p className="text-on-surface-variant">Chưa có sản phẩm liên quan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => {
              const image = item.images.find((img) => img.isMain)?.imageUrl || item.images[0]?.imageUrl || FALLBACK_PRODUCT_IMAGE;

              return (
                <Link key={item.id} href={`/products/${item.slug}`} className="group">
                  <div className="bg-surface-container-low rounded-xl overflow-hidden aspect-square mb-3">
                    <img
                      src={image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-bold text-on-surface mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-primary font-black">{currency.format(item.price)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
