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

export type CartBatch = {
  id: string;
  createdAt: string;
  items: CartItem[];
};

type CartContextValue = {
  batches: CartBatch[];
  totalBatches: number;
  totalItems: number;
  totalPrice: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => string;
  removeBatch: (batchId: string) => void;
  removeBatches: (batchIds: string[]) => void;
  getBatchById: (batchId: string) => CartBatch | undefined;
  syncServerCart: (selectedBatches?: CartBatch[]) => Promise<void>;
  clear: () => Promise<void>;
};

const CART_STORAGE_KEY = "cartBatches";

const CartContext = createContext<CartContextValue | null>(null);

function readFromStorage(): CartBatch[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartBatch[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((batch) => {
        if (!batch || typeof batch.id !== "string" || !Array.isArray(batch.items)) {
          return null;
        }

        const items = batch.items.filter(
          (item) =>
            typeof item?.id === "number"
            && typeof item?.price === "number"
            && typeof item?.quantity === "number"
            && item.quantity > 0
        );

        if (items.length === 0) {
          return null;
        }

        return {
          id: batch.id,
          createdAt: typeof batch.createdAt === "string" ? batch.createdAt : new Date().toISOString(),
          items,
        } satisfies CartBatch;
      })
      .filter((batch): batch is CartBatch => batch !== null);
  } catch {
    return [];
  }
}

function writeToStorage(batches: CartBatch[]) {
  if (typeof window === "undefined") {
    return;
  }

  if (batches.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(batches));
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

function buildBatchId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function aggregateItems(batches: CartBatch[]): CartItem[] {
  const map = new Map<number, CartItem>();

  batches.forEach((batch) => {
    batch.items.forEach((item) => {
      const existing = map.get(item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        map.set(item.id, { ...item });
      }
    });
  });

  return Array.from(map.values());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<CartBatch[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { session, loading: sessionLoading } = useCustomerSession();

  useEffect(() => {
    setBatches(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeToStorage(batches);
  }, [hydrated, batches]);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!session.authenticated) {
      setBatches(readFromStorage());
      setHydrated(true);
      return;
    }

    let cancelled = false;

    const loadServerCart = async () => {
      if (batches.length > 0) {
        return;
      }

      setHydrated(false);

      try {
        const response = await fetch("/api/customer/cart", { cache: "no-store" });
        const data = await response.json().catch(() => []);
        if (!cancelled && response.ok) {
          const normalized = normalizeApiItems(data);
          if (normalized.length > 0) {
            setBatches([
              {
                id: buildBatchId(),
                createdAt: new Date().toISOString(),
                items: normalized,
              },
            ]);
          }
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    };

    void loadServerCart();

    return () => {
      cancelled = true;
    };
  }, [session.authenticated, sessionLoading, batches.length]);

  const totalBatches = useMemo(() => batches.length, [batches.length]);

  const totalItems = useMemo(
    () => batches.reduce((sum, batch) => sum + batch.items.reduce((sub, item) => sub + item.quantity, 0), 0),
    [batches]
  );

  const totalPrice = useMemo(
    () => batches.reduce((sum, batch) => sum + batch.items.reduce((sub, item) => sub + item.price * item.quantity, 0), 0),
    [batches]
  );

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (quantity <= 0) {
      return "";
    }

    const batchId = buildBatchId();
    const createdAt = new Date().toISOString();

    setBatches((prev) => [
      ...prev,
      {
        id: batchId,
        createdAt,
        items: [{ ...item, quantity }],
      },
    ]);

    return batchId;
  };

  const removeBatch = (batchId: string) => {
    setBatches((prev) => prev.filter((batch) => batch.id !== batchId));
  };

  const removeBatches = (batchIds: string[]) => {
    if (batchIds.length === 0) {
      return;
    }

    setBatches((prev) => prev.filter((batch) => !batchIds.includes(batch.id)));
  };

  const getBatchById = (batchId: string) => batches.find((batch) => batch.id === batchId);

  const syncServerCart = async (selectedBatches?: CartBatch[]) => {
    if (!session.authenticated || sessionLoading) {
      return;
    }

    const batchesToSync = selectedBatches ?? batches;
    const aggregated = aggregateItems(batchesToSync);

    if (aggregated.length === 0 && selectedBatches) {
      return;
    }

    const clearResponse = await fetch("/api/customer/cart", { method: "DELETE" });
    if (!clearResponse.ok) {
      throw new Error("Không thể đồng bộ giỏ hàng.");
    }

    if (aggregated.length === 0) {
      return;
    }

    const syncResponse = await fetch("/api/customer/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: aggregated.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    if (!syncResponse.ok) {
      throw new Error("Không thể đồng bộ giỏ hàng.");
    }
  };

  const clear = async (): Promise<void> => {
    setBatches([]);
    clearStorage();

    if (!session.authenticated || sessionLoading) {
      return;
    }

    try {
      await fetch("/api/customer/cart", { method: "DELETE" });
    } catch {
      // Ignore server clear errors.
    }
  };

  const value = useMemo(
    () => ({
      batches,
      totalBatches,
      totalItems,
      totalPrice,
      hydrated,
      addItem,
      removeBatch,
      removeBatches,
      getBatchById,
      syncServerCart,
      clear,
    }),
    [batches, totalBatches, totalItems, totalPrice, hydrated]
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
