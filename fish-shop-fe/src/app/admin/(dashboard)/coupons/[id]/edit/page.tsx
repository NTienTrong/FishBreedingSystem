"use client";

import React from "react";
import CouponForm from "@/components/admin/CouponForm";

export default function EditCouponPage({ params }: { params: { id: string } }) {
  return <CouponForm mode="edit" couponId={Number(params.id)} />;
}
