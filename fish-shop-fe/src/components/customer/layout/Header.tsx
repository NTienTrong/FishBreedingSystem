"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/customer/cart/CartContext";
import { useCustomerSession } from "@/components/customer/auth/useCustomerSession";
import { useWishlist } from "@/components/customer/wishlist/WishlistContext";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalBatches, hydrated } = useCart();
  const { wishlist } = useWishlist();
  const { session } = useCustomerSession();

  const [query, setQuery] = useState("");
  return (
    <header className="fixed top-0 w-full z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(25,28,30,0.04)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link
            className="text-2xl font-black tracking-tighter text-[#005B71] dark:text-white flex items-center gap-2 font-headline"
            href="/"
          >
            FishSync
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-['Manrope'] tracking-tight font-bold headline-sm">
            <Link
              className="text-slate-700 dark:text-slate-300 hover:text-[#005B71] dark:hover:text-[#00A3C4] transition-colors"
              href="/products"
            >
              Sản phẩm
            </Link>
            <Link
              className="text-slate-700 dark:text-slate-300 hover:text-[#005B71] dark:hover:text-[#00A3C4] transition-colors"
              href="/blog"
            >
              Bài viết
            </Link>
            <Link
              className="text-slate-700 dark:text-slate-300 hover:text-[#005B71] dark:hover:text-[#00A3C4] transition-colors"
              href="/profile"
            >
              Hồ sơ
            </Link>
            <Link
              className="text-slate-700 dark:text-slate-300 hover:text-[#005B71] dark:hover:text-[#00A3C4] transition-colors"
              href="/wishlist"
            >
              Yêu thích
            </Link>
            <Link
              className="text-slate-700 dark:text-slate-300 hover:text-[#005B71] dark:hover:text-[#00A3C4] transition-colors"
              href="/cart"
            >
              Giỏ hàng
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full w-80 border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
              }}
              aria-label="search"
              className="material-symbols-outlined text-slate-500 dark:text-slate-400 mr-2 hover:text-[#005B71] transition-colors"
            >
              search
            </button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = query.trim();
                  if (q) router.push(`/products?search=${encodeURIComponent(q)}`);
                }
              }}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium text-slate-800 dark:text-slate-200 outline-none"
              placeholder="Tìm kiếm cá cảnh..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/wishlist" className="relative scale-95 active:scale-90 transition-transform cursor-pointer block" title="Sản phẩm yêu thích">
              <span className="material-symbols-outlined text-primary text-2xl">
                favorite
              </span>
              {session.authenticated && wishlist.length > 0 ? (
                <span className="absolute -top-1 -right-1 bg-[#FF5A5F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              ) : null}
            </Link>
            <Link href="/cart" className="relative scale-95 active:scale-90 transition-transform cursor-pointer block" title="Giỏ hàng">
              <span className="material-symbols-outlined text-primary text-2xl">
                shopping_cart
              </span>
              {hydrated && totalBatches > 0 ? (
                <span className="absolute -top-1 -right-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalBatches}
                </span>
              ) : null}
            </Link>
            {session.authenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-primary px-4 py-2 rounded-full text-white cursor-pointer hover:bg-primary-container transition-all"
              >
                <span className="material-symbols-outlined text-xl">
                  account_circle
                </span>
                <span className="text-sm font-semibold">
                  {session.fullName || session.email || "Khách hàng"}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const currentReturnUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
                  window.location.assign(`/auth/login?returnUrl=${encodeURIComponent(currentReturnUrl)}`);
                }}
                className="flex items-center gap-2 bg-primary px-4 py-2 rounded-full text-white cursor-pointer hover:bg-primary-container transition-all"
              >
                <span className="material-symbols-outlined text-xl">
                  account_circle
                </span>
                <span className="text-sm font-semibold">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
