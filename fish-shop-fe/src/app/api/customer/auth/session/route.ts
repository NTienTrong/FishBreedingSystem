import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/app/config/api";

const TOKEN_COOKIE_NAME = "customerToken";
const ROLE_COOKIE_NAME = "customerRole";

function getCookieMaxAgeFromJwt(token: string): number {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      return 0;
    }

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf-8")) as { exp?: number };

    if (!payload.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    return Math.max(payload.exp - now, 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  const role = cookieStore.get(ROLE_COOKIE_NAME)?.value;

  if (!token || !role) {
    console.warn("[api/customer/auth/session] missing cookie", {
      hasToken: Boolean(token),
      hasRole: Boolean(role),
    });
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const maxAge = getCookieMaxAgeFromJwt(token);
  if (maxAge <= 0) {
    console.warn("[api/customer/auth/session] token expired by exp claim");
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const meResponse = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!meResponse.ok) {
    console.warn("[api/customer/auth/session] backend /api/auth/me unauthorized", {
      status: meResponse.status,
    });
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    response.cookies.set(TOKEN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.set(ROLE_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({ authenticated: true, role });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string; role?: string };
  const token = body.token?.trim();
  const role = body.role?.trim().toUpperCase();

  if (!token || !role) {
    return NextResponse.json({ message: "Missing token or role" }, { status: 400 });
  }

  if (role !== "CUSTOMER") {
    return NextResponse.json({ message: "Only CUSTOMER role can access customer portal" }, { status: 403 });
  }

  const maxAge = getCookieMaxAgeFromJwt(token);
  if (maxAge <= 0) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Session created" });

  response.cookies.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  response.cookies.set(ROLE_COOKIE_NAME, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Keep logout resilient even if backend audit endpoint is unreachable.
    }
  }

  const response = NextResponse.json({ message: "Session cleared" });
  response.cookies.set(TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
