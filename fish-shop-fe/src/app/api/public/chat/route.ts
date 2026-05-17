import { NextResponse } from "next/server";
import { API_URL } from "@/app/config/api";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const response = await fetch(`${API_URL}/api/public/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Chat proxy error:", error);
    return NextResponse.json(
      { message: "Không thể kết nối đến máy chủ tư vấn FishSync" },
      { status: 500 }
    );
  }
}
