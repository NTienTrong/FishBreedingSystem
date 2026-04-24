"use client";

import React, { use } from "react";
import BlogForm from "@/components/admin/BlogForm";

export default function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <BlogForm mode="edit" blogId={Number(id)} />;
}
