"use client";

import React from "react";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProductsEditPage({ params }: { params: { id: string } }) {
  return <ProductForm mode="edit" productId={Number(params.id)} />;
}
