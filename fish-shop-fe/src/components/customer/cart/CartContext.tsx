"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCustomerSession } from "@/components/customer/auth/useCustomerSession";

export type CartItem = {
  id: number;
  name: string;
  sku?: string | null;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clear: () => Promise<void>;
};

const CART_STORAGE_KEY = "cartItems";

const CartContext = createContext<CartContextValue | null>(null);

function readFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item?.id === "number"
        && typeof item?.price === "number"
        && typeof item?.quantity === "number"
        && item.quantity > 0
    );
  } catch {
    return [];
  }
}

function writeToStorage(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  if (items.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function clearStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CART_STORAGE_KEY);
}

function normalizeApiItems(payload: unknown): CartItem[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const mapped: (CartItem | null)[] = payload
    .map((item) => {
      const productId = Number((item as { productId?: number | string })?.productId);
      const price = Number((item as { price?: number | string })?.price);
      const quantity = Number((item as { quantity?: number | string })?.quantity);
      const name = (item as { name?: string })?.name ?? "";
      const imageUrl = (item as { imageUrl?: string | null })?.imageUrl ?? "";
      const sku = (item as { sku?: string | null })?.sku ?? null;

      if (!Number.isFinite(productId) || productId <= 0) {
        return null;
      }

      if (!Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }

      return {
        id: productId,
        name,
        sku,
        price,
        imageUrl,
        quantity,
      } satisfies CartItem;
    });

  return mapped.filter((item): item is CartItem => item !== null);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { session, loading: sessionLoading } = useCustomerSession();

  useEffect(() => {
    setItems(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || session.authenticated) {
      return;
    }

    writeToStorage(items);
  }, [hydrated, items, session.authenticated]);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!session.authenticated) {
      setItems(readFromStorage());
      setHydrated(true);
      return;
    }

    let cancelled = false;

    const syncCart = async () => {
      setHydrated(false);
      const localItems = readFromStorage();
      let syncSucceeded = false;

      try {
        let response: Response;

        if (localItems.length > 0) {
          response = await fetch("/api/customer/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: localItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              })),
            }),
          });
          syncSucceeded = response.ok;
        } else {
          response = await fetch("/api/customer/cart", { cache: "no-store" });
          syncSucceeded = response.ok;
        }

        const data = await response.json().catch(() => []);
        if (!cancelled) {
          setItems(normalizeApiItems(data));
        }
      } catch {
        if (!cancelled && localItems.length > 0) {
          setItems(localItems);
        }
      } finally {
        if (!cancelled) {
          if (syncSucceeded) {
            clearStorage();
          }
          setHydrated(true);
        }
      }
    };

    void syncCart();

    return () => {
      cancelled = true;
    };
  }, [session.authenticated, sessionLoading]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (quantity <= 0) {
      return;
    }

    if (!session.authenticated || sessionLoading) {
      setItems((prev) => {
        const existing = prev.find((entry) => entry.id === item.id);
        if (existing) {
          return prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry
          );
        }

        return [...prev, { ...item, quantity }];
      });
      return;
    }

    void (async () => {
      const response = await fetch("/api/customer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id, quantity }),
      });

      const data = await response.json().catch(() => []);
      if (response.ok) {
        setItems(normalizeApiItems(data));
      }
    })();
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (!session.authenticated || sessionLoading) {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((entry) => entry.id !== id));
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, quantity } : entry))
      );
      return;
    }

    void (async () => {
      const response = await fetch(`/api/customer/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json().catch(() => []);
      if (response.ok) {
        setItems(normalizeApiItems(data));
      }
    })();
  };

  const removeItem = (id: number) => {
    if (!session.authenticated || sessionLoading) {
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }

    void (async () => {
      const response = await fetch(`/api/customer/cart/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => []);
      if (response.ok) {
        setItems(normalizeApiItems(data));
      }
    })();
  };

  const clear = async (): Promise<void> => {
    if (!session.authenticated || sessionLoading) {
      setItems([]);
      clearStorage();
      return;
    }

    try {
      const response = await fetch("/api/customer/cart", { method: "DELETE" });
      const data = await response.json().catch(() => []);
      if (response.ok) {
        setItems(normalizeApiItems(data));
      }
      clearStorage();
    } catch {
      setItems([]);
      clearStorage();
    }
  };

  const value = useMemo(
    () => ({ items, totalItems, totalPrice, hydrated, addItem, updateQuantity, removeItem, clear }),
    [items, totalItems, totalPrice, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}
