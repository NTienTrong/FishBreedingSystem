import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/app/config/api";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerToken")?.value;

  if (!token) {
    console.warn("[api/customer/me] missing customerToken cookie");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.warn("[api/customer/me] backend /api/auth/me unauthorized", {
      status: response.status,
    });
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
