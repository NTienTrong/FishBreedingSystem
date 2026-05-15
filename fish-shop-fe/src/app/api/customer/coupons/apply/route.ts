import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/app/config/api";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để sử dụng mã giảm giá" }, { status: 401 });
  }

  const body = await request.text();

  try {
    const response = await fetch(`${API_URL}/api/v1/coupons/apply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return NextResponse.json({ message: text }, { status: response.status });
  } catch (error) {
    console.error("Coupon apply proxy error:", error);
    return NextResponse.json({ message: "Không thể kết nối đến máy chủ" }, { status: 500 });
  }
}
