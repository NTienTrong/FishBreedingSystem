"use client";

import { useState } from "react";
import { useCart } from "@/components/customer/cart/CartContext";

type AddToCartButtonProps = {
  productId: number;
  name: string;
  sku?: string | null;
  price: number;
  imageUrl: string;
  quantity?: number;
  className?: string;
  label?: string;
  onAdded?: () => void;
};

export default function AddToCartButton({
  productId,
  name,
  sku,
  price,
  imageUrl,
  quantity = 1,
  className,
  label = "Thêm vào giỏ hàng",
  onAdded,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    addItem({ id: productId, name, sku, price, imageUrl }, quantity);
    onAdded?.();
    setTimeout(() => setLoading(false), 150);
  };

  return (
    <button className={className} type="button" onClick={handleClick}>
      {loading ? "Đang thêm..." : label}
    </button>
  );
}
