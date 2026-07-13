import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/app/config/api";

const TOKEN_COOKIE_NAME = "adminToken";
const ROLE_COOKIE_NAME = "adminRole";

export async function forwardAdminRequest(request: Request, backendPath: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  const role = cookieStore.get(ROLE_COOKIE_NAME)?.value?.toUpperCase();

  if (!token || role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(backendPath, API_URL);
  targetUrl.search = incomingUrl.search;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const method = request.method.toUpperCase();
  const isMultipart = contentType?.toLowerCase().includes("multipart/form-data");
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : isMultipart
        ? await request.arrayBuffer()
        : await request.text();

  const response = await fetch(targetUrl.toString(), {
    method,
    headers,
    body,
    cache: "no-store",
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: response.status });
  }

  const responseBody = await response.text();
  if (!responseBody) {
    return new NextResponse(null, { status: response.status });
  }

  const responseContentType = response.headers.get("content-type") || "application/json";

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": responseContentType,
    },
  });
}
