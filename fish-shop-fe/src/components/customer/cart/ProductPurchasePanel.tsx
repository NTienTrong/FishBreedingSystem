"use client";

import { useState } from "react";
import AddToCartButton from "@/components/customer/cart/AddToCartButton";
import BuyNowButton from "@/components/customer/cart/BuyNowButton";
import QuantitySelector from "@/components/customer/cart/QuantitySelector";

type ProductPurchasePanelProps = {
  productId: number;
  name: string;
  sku?: string | null;
  price: number;
  imageUrl: string;
  stockQuantity: number;
};

export default function ProductPurchasePanel({
  productId,
  name,
  sku,
  price,
  imageUrl,
  stockQuantity,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const max = stockQuantity > 0 ? stockQuantity : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-on-surface-variant">Chọn số lượng</span>
        <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={max} />
      </div>
      <div className="space-y-3">
        <BuyNowButton
          productId={productId}
          name={name}
          sku={sku}
          price={price}
          imageUrl={imageUrl}
          className="w-full py-4 rounded-full bg-primary text-white font-bold hover:bg-primary-container transition-colors"
        />
        <AddToCartButton
          productId={productId}
          name={name}
          sku={sku}
          price={price}
          imageUrl={imageUrl}
          quantity={quantity}
          className="w-full py-4 rounded-full bg-surface-container-high text-primary font-bold hover:bg-surface-container-highest transition-colors"
          label="Thêm vào giỏ hàng"
        />
      </div>
    </div>
  );
}
