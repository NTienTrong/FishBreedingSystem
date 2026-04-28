import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/app/config/api";

export async function DELETE(_: Request, { params }: { params: { productId: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/api/customer/wishlist/${params.productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
