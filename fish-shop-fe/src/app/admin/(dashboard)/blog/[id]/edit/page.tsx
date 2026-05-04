"use client";

import React, { use } from "react";
import BlogForm from "@/components/admin/BlogForm";

export default function AdminBlogEditPage({ 
  params, 
}: { 
  params: { id: string };
}) {
  const id = Number(params.id);

  return <BlogForm mode="edit" blogId={Number(id)} />;
}
