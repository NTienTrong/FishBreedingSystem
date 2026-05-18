"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LogoutConfirmModal from "@/components/common/LogoutConfirmModal";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);

    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } finally {
      setIsLoggingOut(false);
      router.push('/admin/login');
      router.refresh();
    }
  };

  const openLogoutModal = () => {
    if (!isLoggingOut) {
      setIsLogoutModalOpen(true);
    }
  };

  const closeLogoutModal = () => {
    if (!isLoggingOut) {
      setIsLogoutModalOpen(false);
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "dashboard" },
    { name: "Products", href: "/admin/products", icon: "inventory_2" },
    { name: "Inventory", href: "/admin/inventory", icon: "inventory" },
    { name: "Categories", href: "/admin/categories", icon: "category" },
    { name: 'Attributes', href: "/admin/attributes", icon: "tune" },
    { name: "Orders", href: "/admin/orders", icon: "shopping_cart" },
    { name: "Transactions", href: "/admin/transactions", icon: "payments" },
    { name: "Discount", href: "/admin/coupons", icon: "sell" },
    { name: "Blog", href: "/admin/blog", icon: "article" },
    { name: "Users", href: "/admin/users", icon: "group" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full z-40 bg-slate-50 dark:bg-slate-900 w-64 flex flex-col border-none font-['Manrope'] text-sm tracking-tight">
      <div className="p-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
        </div>
        <h1 className="text-lg font-extrabold text-[#005B71] dark:text-white tracking-tighter">DeepStream Pro</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Hatchery Management</p>
      </div>

      <nav className="flex-1 mt-6 overflow-y-auto custom-scrollbar px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-transform duration-200 group ${isActive
                  ? "bg-[#005B71] text-white rounded-r-full shadow-lg shadow-[#005B71]/20 scale-95 active:scale-100"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                  }`}
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                  {item.icon}
                </span>
                <span className={isActive ? "font-bold" : "font-medium"}>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* <div className="px-4 mt-10 mb-6">
          <button className="w-full bg-linear-to-br from-primary to-primary-container text-white py-3 rounded-full font-bold text-xs tracking-widest uppercase shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            New Batch
          </button>
        </div> */}
      </nav>

      <div className="p-6 bg-slate-100 dark:bg-slate-800/50 space-y-2 border-t border-slate-200 dark:border-slate-700/50">
        {/* <Link href="#" className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-primary transition-colors rounded-lg">
          <span className="material-symbols-outlined">help</span>
          <span className="font-medium">Support</span>
        </Link> */}
        <button
          className="flex w-full items-center gap-3 px-4 py-2 text-slate-500 hover:text-error transition-colors rounded-lg disabled:opacity-60"
          onClick={openLogoutModal}
          disabled={isLoggingOut}
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isSubmitting={isLoggingOut}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
