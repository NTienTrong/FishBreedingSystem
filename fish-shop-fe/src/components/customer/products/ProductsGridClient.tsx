"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductResponse } from "@/types/product";
import AddToCartButton from "@/components/customer/cart/AddToCartButton";
import QuantitySelector from "@/components/customer/cart/QuantitySelector";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const FALLBACK_PRODUCT_IMAGE = "https://via.placeholder.com/640x480?text=No+Image";

function getMainImage(product: ProductResponse): string {
  return (
    product.images.find((image) => image.isMain)?.imageUrl ||
    product.images[0]?.imageUrl ||
    FALLBACK_PRODUCT_IMAGE
  );
}

export default function ProductsGridClient({ products }: { products: ProductResponse[] }) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleQuantityChange = (productId: number, next: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: next }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => {
        const imageUrl = getMainImage(product);
        const quantity = quantities[product.id] ?? 1;
        const max = product.stockQuantity > 0 ? product.stockQuantity : undefined;

        return (
          <div key={product.id} className="group rounded-2xl border border-transparent hover:border-surface-container-high transition-colors p-2">
            <Link href={`/products/${product.slug}`} className="block">
              <div className="aspect-4/3 bg-surface-container-low rounded-2xl overflow-hidden mb-4">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={imageUrl}
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
                  <span className="text-lg font-black text-primary">{currency.format(product.price)}</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      product.stockQuantity > 0
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : "Hết hàng"}
                  </span>
                </div>
              </div>
            </Link>

            <div className="px-1 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">Số lượng</span>
                <QuantitySelector value={quantity} onChange={(next) => handleQuantityChange(product.id, next)} min={1} max={max} />
              </div>
              <AddToCartButton
                productId={product.id}
                name={product.name}
                sku={product.sku}
                price={product.price}
                imageUrl={imageUrl}
                quantity={quantity}
                className="w-full py-3 rounded-full bg-surface-container-high text-primary font-bold hover:bg-surface-container-highest transition-colors"
                label="Thêm vào giỏ"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
