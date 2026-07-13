"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/customer/layout/Header";
import Footer from "@/components/customer/layout/Footer";
import FloatingChatbox from "@/components/customer/chat/FloatingChatbox";
import ToastMessage from "@/components/common/ToastMessage";
import { CartProvider } from "@/components/customer/cart/CartContext";
import { WishlistProvider } from "@/components/customer/wishlist/WishlistContext";

const WELCOME_MESSAGE_KEY = "welcomeMessage";

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initialToast = useMemo(() => {
    if (typeof window === "undefined" || pathname !== "/") {
      return null;
    }

    const message = sessionStorage.getItem(WELCOME_MESSAGE_KEY);
    if (message) {
      sessionStorage.removeItem(WELCOME_MESSAGE_KEY);
    }
    return message;
  }, [pathname]);

  const [toastMessage, setToastMessage] = useState<string | null>(initialToast);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="flex flex-col min-h-screen bg-background text-on-background font-body selection:bg-secondary-container">
          <Header />
          <div className="grow pt-24">{children}</div>
          <Footer />
          <FloatingChatbox />
          <ToastMessage show={Boolean(toastMessage)} message={toastMessage ?? ""} variant="success" />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
