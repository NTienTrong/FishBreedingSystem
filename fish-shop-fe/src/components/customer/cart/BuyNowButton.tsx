"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/customer/cart/CartContext";
import { useCustomerSession } from "@/components/customer/auth/useCustomerSession";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

type BuyNowButtonProps = {
  productId: number;
  name: string;
  sku?: string | null;
  price: number;
  imageUrl: string;
  className?: string;
};

export default function BuyNowButton({ productId, name, sku, price, imageUrl, className }: BuyNowButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { session, loading: sessionLoading } = useCustomerSession();
  const [loginTarget, setLoginTarget] = useState<string | null>(null);

  const handleClick = () => {
    const batchId = addItem({ id: productId, name, sku, price, imageUrl }, 1);
    const nextUrl = batchId ? `/checkout?batchId=${batchId}` : "/checkout";

    if (sessionLoading || !session.authenticated) {
      setLoginTarget(nextUrl);
      return;
    }

    router.push(nextUrl);
  };

  return (
    <>
      <button className={className} type="button" onClick={handleClick}>
        Mua ngay
      </button>
      <LoginRequiredModal
        isOpen={Boolean(loginTarget)}
        onClose={() => setLoginTarget(null)}
        onConfirm={() => {
          if (!loginTarget) return;
          const target = `/auth/login?returnUrl=${encodeURIComponent(loginTarget)}`;
          setLoginTarget(null);
          window.location.assign(target);
        }}
      />
    </>
  );
}
