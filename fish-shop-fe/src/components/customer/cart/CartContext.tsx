"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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
  clear: () => void;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    writeToStorage(items);
  }, [items]);

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
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }

    setItems((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, quantity } : entry))
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clear = () => setItems([]);

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
