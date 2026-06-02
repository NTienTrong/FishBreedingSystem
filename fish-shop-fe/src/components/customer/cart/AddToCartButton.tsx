"use client";

import { useCallback, useState } from "react";
import { useCart } from "@/components/customer/cart/CartContext";
import ToastMessage from "@/components/common/ToastMessage";

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
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: "success" | "error" }>({
    show: false,
    message: "",
    variant: "success",
  });

  const showToast = useCallback((message: string, variant: "success" | "error") => {
    setToast({ show: true, message, variant });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  }, []);

  const handleClick = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      addItem({ id: productId, name, sku, price, imageUrl }, quantity);
      onAdded?.();
      showToast("Thêm vào giỏ hàng thành công!", "success");
    } catch {
      showToast("Có lỗi xảy ra, không thể cập nhật giỏ hàng lúc này", "error");
    } finally {
      setTimeout(() => setLoading(false), 150);
    }
  };

  return (
    <>
      <button className={className} type="button" onClick={handleClick}>
        {loading ? "Đang thêm..." : label}
      </button>
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />
    </>
  );
}
