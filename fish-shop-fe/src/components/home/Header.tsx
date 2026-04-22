import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-glass border-b border-outline-variant/15 px-4 md:px-10 lg:px-20 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="size-8 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="font-headline text-xl font-extrabold tracking-tight text-primary hidden sm:block">Hydro-Precision</h1>
        </div>

        {/* Smart Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input className="block w-full pl-10 pr-3 py-2 bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 placeholder:text-outline/60 text-sm outline-none" placeholder="Tìm giống cá, thức ăn hoặc phụ kiện..." type="text" />
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 md:gap-5">
          <a className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined">local_shipping</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider hidden lg:block">Tra cứu</span>
          </a>
          <div className="relative">
            <button className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[10px] font-bold px-1.5 rounded-full">3</span>
            </button>
          </div>
          <Link href="/admin/products" className="hidden sm:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-headline text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">person</span>
            Đăng nhập
          </Link>
        </div>
      </div>

      {/* Category Menu */}
      <nav className="max-w-7xl mx-auto mt-3 hidden md:flex items-center gap-8 border-t border-outline-variant/10 pt-3">
        <Link href="/" className="text-sm font-semibold text-primary border-b-2 border-primary pb-1">Trang chủ</Link>
        <Link href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Cá Koi</Link>
        <Link href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Cá Rồng</Link>
        <Link href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Cá Vàng</Link>
        <Link href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Thức ăn</Link>
        <Link href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Phụ kiện</Link>
        <Link href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Kỹ thuật</Link>
      </nav>
    </header>
  );
}
