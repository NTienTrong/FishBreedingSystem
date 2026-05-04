import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/app/config/api";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/api/customer/checkout/vnpay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}