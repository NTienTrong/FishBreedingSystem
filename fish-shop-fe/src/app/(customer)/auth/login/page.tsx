"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/app/config/api";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const { data: authSession, status: authStatus } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [linkingSession, setLinkingSession] = useState(false);
  const [nextUrl, setNextUrl] = useState("/");
  const sessionLinkedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextUrl(params.get("returnUrl") || params.get("next") || "/");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!identifier.trim()) {
      nextErrors.identifier = "Vui lòng nhập email hoặc tên đăng nhập.";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }

    setValidationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier.trim(), password }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Đăng nhập thất bại.");
      }

      const data = (await response.json()) as { token: string; role: string };

      const sessionResponse = await fetch("/api/customer/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: data.token, role: data.role }),
      });

      if (!sessionResponse.ok) {
        const sessionMessage = await sessionResponse.text();
        throw new Error(sessionMessage || "Không thể khởi tạo phiên đăng nhập.");
      }

      window.dispatchEvent(new Event("customer-session-updated"));
      router.push(nextUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const linkSession = async () => {
      if (authStatus !== "authenticated") {
        return;
      }

      if (sessionLinkedRef.current) {
        return;
      }

      const backendToken = (authSession as { backendToken?: string })?.backendToken;
      const backendRole = (authSession as { role?: string })?.role;
      const backendError = (authSession as { backendError?: string })?.backendError;

      if (backendError) {
        setError(backendError);
        await signOut({ redirect: false });
        return;
      }

      if (!backendToken || !backendRole) {
        return;
      }

      try {
        setLinkingSession(true);
        const sessionResponse = await fetch("/api/customer/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: backendToken, role: backendRole }),
        });

        if (!sessionResponse.ok) {
          const sessionMessage = await sessionResponse.text();
          throw new Error(sessionMessage || "Không thể khởi tạo phiên đăng nhập.");
        }

        sessionLinkedRef.current = true;
        window.dispatchEvent(new Event("customer-session-updated"));
        router.push(nextUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể khởi tạo phiên đăng nhập.";
        setError(message);
        await signOut({ redirect: false });
      } finally {
        setLinkingSession(false);
      }
    };

    void linkSession();
  }, [authSession, authStatus, nextUrl, router, signOut]);
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Layer with Blur */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover blur-md scale-105 opacity-60"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG8uzkDMPRJesL0CTg3X7sa1xwnUOWkhSdkOghCKMUdnIprjOK9ExuS3xwbjUyLJQiAmGQHHC2C6XJ3mIFjUkJpfcsCdrTtUbzinfP8MGpcCapHeS5yu7AOQhwZDLKf1GCvLn3HoV8Wza1aD6Mof-r-woN5HEusHmLLbqCwdRDqsltEwRJiwq7Naa62Smn4tOEONHBkhKn5dnB1BcJHwTzmNpnx-jBicPr4N9Puvrk4jwSO6JA_KGfVEj5OEKZ21sirWzBkIDe6bSA"
          alt="Koi pond background"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent"></div>
      </div>

      {/* Main Content Shell */}
      <main className="relative z-10 w-full max-w-md my-12">
        <div className="bg-white/70 backdrop-blur-2xl p-8 md:p-10 rounded-4xl shadow-[0_20px_40px_rgba(25,28,30,0.08)] border border-white/30 transition-all duration-300">
          {/* Brand Anchor */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="mb-4 bg-gradient-to-r from-primary to-primary-container p-3 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl">
                water_drop
              </span>
            </div>
            <h1 className="font-headline font-black text-4xl tracking-tighter text-primary mb-2">
              FishSync
            </h1>
            <p className="text-on-surface-variant font-medium text-sm">
              Quản lý nuôi trồng thủy sản chính xác
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username/Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="identifier">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  person
                </span>
                <input
                  className="w-full bg-surface-container-high border-0 rounded-lg py-3 pl-12 pr-6 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all placeholder:text-outline/60"
                  id="identifier"
                  name="identifier"
                  placeholder="example@fishsync.com"
                  type="text"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    if (validationErrors.identifier) {
                      setValidationErrors((prev) => ({ ...prev, identifier: "" }));
                    }
                  }}
                />
              </div>
              {validationErrors.identifier ? (
                <p className="text-error text-xs px-1">{validationErrors.identifier}</p>
              ) : null}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  className="w-full bg-surface-container-high border-0 rounded-lg py-3 pl-12 pr-12 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all placeholder:text-outline/60"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
              {validationErrors.password ? (
                <p className="text-error text-xs px-1">{validationErrors.password}</p>
              ) : null}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    className="peer h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-highest transition-all"
                    type="checkbox"
                  />
                </div>
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Ghi nhớ tôi
                </span>
              </label>
              <Link
                className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                href="/auth/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Primary CTA */}
            <button
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-headline font-bold text-lg shadow-[0_8px_20px_-4px_rgba(0,66,83,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(0,66,83,0.4)] transition-all transform active:scale-[0.98]"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl bg-error/10 text-error text-sm px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-10 flex items-center">
            <div className="grow border-t border-outline-variant/30"></div>
            <span className="mx-4 text-xs font-bold uppercase tracking-widest text-outline">
              Hoặc tiếp tục với
            </span>
            <div className="grow border-t border-outline-variant/30"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-1 gap-4">
            <button
              className="flex items-center justify-center gap-3 py-3 px-4 bg-white/70 border border-white/30 rounded-full hover:bg-white transition-all group"
              type="button"
              onClick={() =>
                signIn("google", {
                  callbackUrl: `/auth/login?next=${encodeURIComponent(nextUrl)}`,
                })
              }
              disabled={loading || linkingSession || authStatus === "loading"}
            >
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                <img
                  alt="Google"
                  className="w-4 h-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsqlMZNjUOl6m8aQSQVOeR5Op0dKy_Bb-lKMrmXtFvcv8OotbN3qGLJh2zPozlREOfxKycFAb8Cbxrr_ZRVKbR8g51oXPooCJ8m_RtNEU2FfyfbWHXSc07XNuOlddNkz0g1WdKTacNHnNDjkaM8roaFh5iKY1pwFfN-r5MQdZkakM4vjLaAYxYjAqdm_wbHuulry8xz8YHvFeNsJzgOCjzui10eymqdYqKGsSC8HX62sjX-it82bfzyu3Hljdw95WI8TA65ecDLZ-z"
                />
              </span>
              <span className="text-sm font-semibold text-on-surface">Đăng nhập với Google</span>
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant">
              Chưa có tài khoản?
              <Link
                className="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4"
                href={`/auth/register?next=${encodeURIComponent(nextUrl)}`}
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Technical Footer Decoration */}
        <div className="mt-8 flex justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px]">
              verified_user
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Mã hóa AES-256
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px]">
              cloud_sync
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Phục hồi dữ liệu 24/7
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
