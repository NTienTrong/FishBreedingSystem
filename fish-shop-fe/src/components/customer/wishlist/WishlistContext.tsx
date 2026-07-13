"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useCustomerSession } from "@/components/customer/auth/useCustomerSession";

export type WishlistItem = {
  productId: number;
  name: string;
  slug: string;
  sku?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
};

type WishlistContextValue = {
  wishlist: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { session } = useCustomerSession();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!session.authenticated) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/customer/wishlist", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        // Backend returns an array, fallback to empty array if response is empty/null
        setWishlist(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [session.authenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId: number) => {
      return wishlist.some((item) => item.productId === productId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: number): Promise<boolean> => {
      if (!session.authenticated) {
        // Redirect to login if not logged in
        const currentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
        window.location.assign(`/auth/login?returnUrl=${encodeURIComponent(currentUrl)}`);
        return false;
      }

      const alreadyIn = isInWishlist(productId);

      if (alreadyIn) {
        // Remove from wishlist
        try {
          const response = await fetch(`/api/customer/wishlist/${productId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            setWishlist((prev) => prev.filter((item) => item.productId !== productId));
            return true;
          }
        } catch (error) {
          console.error("Error removing from wishlist:", error);
        }
      } else {
        // Add to wishlist
        try {
          const response = await fetch("/api/customer/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.productId) {
              setWishlist((prev) => [data, ...prev]);
              return true;
            }
          }
        } catch (error) {
          console.error("Error adding to wishlist:", error);
        }
      }
      return false;
    },
    [session.authenticated, isInWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
