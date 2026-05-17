"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/customer/cart/CartContext";
import { useCustomerSession } from "@/components/customer/auth/useCustomerSession";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalBatches, hydrated } = useCart();
  const { session } = useCustomerSession();

  const [query, setQuery] = useState("");

  const returnUrl = pathname || "/";
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link
            className="text-2xl font-black tracking-tighter text-[#005B71] dark:text-white flex items-center gap-2 font-headline"
            href="/"
          >
            FishSync
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-['Manrope'] tracking-tight font-bold headline-sm">
            <div className="relative group">
              <button className="text-[#005B71] dark:text-[#00A3C4] border-b-2 border-[#005B71] font-bold pb-1 flex items-center gap-1">
                Danh mục
                <span className="material-symbols-outlined text-sm">
                  keyboard_arrow_down
                </span>
              </button>
              <div className="mega-menu-content absolute top-full left-0 mt-4 w-64 bg-surface-container-lowest shadow-2xl p-4 rounded-xl hidden group-hover:block">
                <ul className="space-y-3">
                  <li>
                    <Link
                      className="block text-slate-600 hover:text-[#005B71] transition-colors p-2 rounded-lg hover:bg-slate-100/50"
                      href="/products"
                    >
                      Tất cả sản phẩm
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="block text-slate-600 hover:text-[#005B71] transition-colors p-2 rounded-lg hover:bg-slate-100/50"
                      href="/#danh-muc"
                    >
                      Danh mục hiện có
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="block text-slate-600 hover:text-[#005B71] transition-colors p-2 rounded-lg hover:bg-slate-100/50"
                      href="/blog"
                    >
                      Blog kỹ thuật
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <Link
              className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] transition-colors"
              href="/products"
            >
              Sản phẩm
            </Link>
            <Link
              className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] transition-colors"
              href="/blog"
            >
              Blog
            </Link>
            <Link
              className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] transition-colors"
              href="/profile"
            >
              Hồ sơ
            </Link>
            <Link
              className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] transition-colors"
              href="/cart"
            >
              Giỏ hàng
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center bg-surface-container-high px-4 py-2 rounded-full w-80">
            <button
              type="button"
              onClick={() => {
                if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
              }}
              aria-label="search"
              className="material-symbols-outlined text-outline mr-2"
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
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
              placeholder="Tìm kiếm cá cảnh..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative scale-95 active:scale-90 transition-transform cursor-pointer block">
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
              <Link
                href={`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="flex items-center gap-2 bg-primary px-4 py-2 rounded-full text-white cursor-pointer hover:bg-primary-container transition-all"
              >
                <span className="material-symbols-outlined text-xl">
                  account_circle
                </span>
                <span className="text-sm font-semibold">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
