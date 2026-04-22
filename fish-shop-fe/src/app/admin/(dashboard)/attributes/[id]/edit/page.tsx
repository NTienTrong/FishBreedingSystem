"use client";

import React, { use } from "react";
import AttributeForm from "@/components/admin/AttributeForm";

export default function AdminAttributesEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <AttributeForm mode="edit" attributeId={Number(id)} />;
}
