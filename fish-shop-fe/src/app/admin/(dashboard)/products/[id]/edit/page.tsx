"use client";

import React, { use } from "react";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProductsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <ProductForm mode="edit" productId={Number(id)} />;
}
