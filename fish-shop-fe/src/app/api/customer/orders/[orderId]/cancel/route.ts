import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/app/config/api";

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();

  const response = await fetch(`${API_URL}/api/v1/orders/${params.orderId}/customer-cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const data = await response.text();
  return new NextResponse(data, { status: response.status, headers: { "Content-Type": "application/json" } });
}
