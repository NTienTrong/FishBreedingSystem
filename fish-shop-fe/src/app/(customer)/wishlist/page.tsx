"use client";

import { useWishlist } from "@/components/customer/wishlist/WishlistContext";
import { useCart } from "@/components/customer/cart/CartContext";
import { useCustomerSession } from "@/components/customer/auth/useCustomerSession";
import { useState, useCallback } from "react";
import Link from "next/link";
import ToastMessage from "@/components/common/ToastMessage";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const FALLBACK_PRODUCT_IMAGE = "https://via.placeholder.com/640x480?text=No+Image";

export default function WishlistPage() {
  const { session, loading: sessionLoading } = useCustomerSession();
  const { wishlist, loading: wishlistLoading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

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

  const handleRemove = async (productId: number) => {
    const success = await toggleWishlist(productId);
    if (success) {
      showToast("Đã xóa sản phẩm khỏi danh sách yêu thích!", "success");
    } else {
      showToast("Có lỗi xảy ra, vui lòng thử lại sau.", "error");
    }
  };

  const handleAddToCart = (item: {
    productId: number;
    name: string;
    sku?: string | null;
    price: number;
    imageUrl?: string | null;
  }) => {
    try {
      addItem({
        id: item.productId,
        name: item.name,
        sku: item.sku,
        price: item.price,
        imageUrl: item.imageUrl || FALLBACK_PRODUCT_IMAGE,
      });
      showToast("Thêm vào giỏ hàng thành công!", "success");
    } catch {
      showToast("Không thể thêm vào giỏ hàng lúc này.", "error");
    }
  };

  if (sessionLoading || wishlistLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-on-surface-variant">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <main className="px-6 max-w-7xl mx-auto py-16 text-center">
        <div className="max-w-md mx-auto bg-surface-container-low rounded-2xl p-8 border border-surface-container-high shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 opacity-75">
            favorite
          </span>
          <h1 className="text-2xl font-extrabold text-primary mb-3">Yêu cầu đăng nhập</h1>
          <p className="text-on-surface-variant mb-6 text-sm">
            Vui lòng đăng nhập tài khoản của bạn để xem và quản lý danh sách sản phẩm yêu thích.
          </p>
          <button
            onClick={() => {
              const currentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/wishlist";
              window.location.assign(`/auth/login?returnUrl=${encodeURIComponent(currentUrl)}`);
            }}
            className="w-full py-3.5 rounded-full bg-primary text-white font-bold hover:bg-primary-container transition-colors shadow-md hover:scale-[1.02] active:scale-95 duration-200"
          >
            Đăng nhập ngay
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 max-w-7xl mx-auto py-12 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-primary font-headline tracking-tight">Sản phẩm yêu thích</h1>
          <p className="text-on-surface-variant text-sm mt-1">Danh sách sản phẩm bạn đã lưu</p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#005B71] dark:text-[#00A3C4] hover:underline"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Tiếp tục mua sắm
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-surface-container-high shadow-sm max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-7xl text-[#FF5A5F] mb-4 opacity-80" style={{ fontVariationSettings: "'FILL' 0" }}>
            favorite
          </span>
          <h2 className="text-2xl font-bold text-primary mb-2">Danh sách yêu thích trống</h2>
          <p className="text-on-surface-variant max-w-sm mx-auto mb-8 text-sm">
            Hãy khám phá các sản phẩm cá cảnh độc đáo của chúng tôi và lưu lại những chú cá bạn yêu thích nhất!
          </p>
          <Link
            href="/products"
            className="px-8 py-3.5 rounded-full bg-primary text-white font-bold hover:bg-primary-container transition-all shadow-md hover:shadow-lg inline-block"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => {
            const imageUrl = item.imageUrl || FALLBACK_PRODUCT_IMAGE;
            const inStock = item.stockQuantity > 0;

            return (
              <div
                key={item.productId}
                className="group relative rounded-2xl border border-transparent hover:border-surface-container-high transition-colors p-2 flex flex-col bg-surface-container-lowest"
              >
                <button
                  type="button"
                  onClick={() => handleRemove(item.productId)}
                  className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md text-red-500 hover:scale-110 active:scale-95 transition-all"
                  title="Xóa khỏi yêu thích"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>

                <Link href={`/products/${item.slug}`} className="block flex-1">
                  <div className="aspect-4/3 bg-surface-container-low rounded-2xl overflow-hidden mb-4 relative">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={imageUrl}
                      alt={item.name}
                    />
                  </div>

                  <div className="space-y-2 px-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-headline font-extrabold text-primary leading-tight group-hover:text-secondary transition-colors text-lg">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-outline font-bold bg-surface-container-high px-2 py-1 rounded uppercase shrink-0">
                        {item.sku || "No SKU"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-black text-primary">{currency.format(item.price)}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          inStock
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {inStock ? `Còn ${item.stockQuantity}` : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="px-1 pt-4 mt-auto flex gap-2">
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex-1 py-3 text-center rounded-full bg-surface-container-high text-primary font-bold hover:bg-surface-container-highest transition-colors text-sm"
                  >
                    Xem chi tiết
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    disabled={!inStock}
                    className={`flex-1 py-3 rounded-full text-white font-bold transition-all text-sm flex items-center justify-center gap-1.5 ${
                      inStock
                        ? "bg-primary hover:bg-primary-container"
                        : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">shopping_cart</span>
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />
    </main>
  );
}
