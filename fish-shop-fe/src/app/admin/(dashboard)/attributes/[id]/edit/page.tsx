"use client";

import React from "react";
import AttributeForm from "@/components/admin/AttributeForm";

export default function AdminAttributesEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  return <AttributeForm mode="edit" attributeId={id} />;
}
