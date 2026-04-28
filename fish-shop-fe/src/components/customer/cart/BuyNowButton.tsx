"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/customer/cart/CartContext";

type BuyNowButtonProps = {
  productId: number;
  name: string;
  sku?: string | null;
  price: number;
  imageUrl: string;
  className?: string;
};

export default function BuyNowButton({ productId, name, sku, price, imageUrl, className }: BuyNowButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleClick = () => {
    addItem({ id: productId, name, sku, price, imageUrl }, 1);
    router.push("/checkout");
  };

  return (
    <button className={className} type="button" onClick={handleClick}>
      Mua ngay
    </button>
  );
}
