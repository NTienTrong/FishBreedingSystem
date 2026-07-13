"use client";

import { useState, useCallback } from "react";
import AddToCartButton from "@/components/customer/cart/AddToCartButton";
import BuyNowButton from "@/components/customer/cart/BuyNowButton";
import QuantitySelector from "@/components/customer/cart/QuantitySelector";
import { useWishlist } from "@/components/customer/wishlist/WishlistContext";
import ToastMessage from "@/components/common/ToastMessage";

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

  const { isInWishlist, toggleWishlist } = useWishlist();
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

  const liked = isInWishlist(productId);

  const handleToggleWishlist = async () => {
    const isAdding = !liked;
    const success = await toggleWishlist(productId);
    if (success) {
      showToast(
        isAdding ? "Đã thêm vào danh sách yêu thích!" : "Đã xóa khỏi danh sách yêu thích!",
        "success"
      );
    }
  };

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
        <div className="flex gap-3">
          <AddToCartButton
            productId={productId}
            name={name}
            sku={sku}
            price={price}
            imageUrl={imageUrl}
            quantity={quantity}
            className="flex-1 py-4 rounded-full bg-surface-container-high text-primary font-bold hover:bg-surface-container-highest transition-colors"
            label="Thêm vào giỏ"
          />
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`px-6 rounded-full border transition-all flex items-center justify-center gap-2 font-bold ${
              liked
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-[#FF5A5F] hover:bg-red-100"
                : "bg-surface-container-high border-transparent text-primary hover:bg-surface-container-highest"
            }`}
            title={liked ? "Xóa khỏi Yêu thích" : "Thêm vào Yêu thích"}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: liked ? "'FILL' 1" : undefined }}
            >
              favorite
            </span>
            <span className="hidden sm:inline">
              {liked ? "Đã thích" : "Yêu thích"}
            </span>
          </button>
        </div>
      </div>
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />
    </div>
  );
}
