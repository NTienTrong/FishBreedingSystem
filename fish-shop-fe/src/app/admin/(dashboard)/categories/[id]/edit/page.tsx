"use client";

import React from "react";
import CategoryForm from "@/components/admin/CategoryForm";

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  return <CategoryForm mode="edit" categoryId={Number(params.id)} />;
}
