"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);
  const sessionLinkedRef = useRef(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernamePattern = /^[a-zA-Z0-9._-]{3,50}$/;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextUrl(params.get("returnUrl") || params.get("next") || "/");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier) {
      nextErrors.identifier = "Vui lòng nhập email hoặc tên đăng nhập.";
    } else if (trimmedIdentifier.includes("@")) {
      if (!emailPattern.test(trimmedIdentifier)) {
        nextErrors.identifier = "Email không hợp lệ.";
      }
    } else if (!usernamePattern.test(trimmedIdentifier)) {
      nextErrors.identifier = "Tên đăng nhập 3-50 ký tự.";
    }

    if (!trimmedPassword) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (trimmedPassword.length < 6) {
      nextErrors.password = "Mật khẩu tối thiểu 6 ký tự.";
    }

    setValidationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await signIn("credentials", {
        redirect: false,
        identifier: trimmedIdentifier,
        password: trimmedPassword,
      });

      if (result?.error) {
        var errorMessage = result.error
        if (result.error == "Account is inactive") {
          errorMessage = "Tài khoản của bạn đã bị khóa."
        }
        setError(result.error || "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }

      if (!result?.ok) {
        setError("Đăng nhập thất bại.");
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại.";
      setError(message);
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
        console.warn("[login] missing backend token in NextAuth session", {
          hasToken: Boolean(backendToken),
          hasRole: Boolean(backendRole),
        });
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
          console.warn("[login] failed to set customer session cookie", {
            status: sessionResponse.status,
          });
          const sessionMessage = await sessionResponse.text();
          throw new Error(sessionMessage || "Không thể khởi tạo phiên đăng nhập.");
        }

        const meResponse = await fetch("/api/customer/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (!meResponse.ok) {
          console.warn("[login] backend /api/customer/me unauthorized", {
            status: meResponse.status,
          });
          await fetch("/api/customer/auth/session", { method: "DELETE" });
          throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng thử lại.");
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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-12 px-6 bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-fixed-dim/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary-fixed-dim/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-white/80 backdrop-blur-2xl rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] overflow-hidden z-10 border border-white/50">
        {/* Left Side: Visual/Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-primary-container relative overflow-hidden">
          <div className="z-10">
            <div className="flex items-center gap-2 mb-12">
              <span className="text-3xl font-extrabold font-headline tracking-tighter text-white">FishSync</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-white leading-tight tracking-tight mb-6">
              Tiêu chuẩn mới trong <span className="text-on-primary-container">nuôi trồng thủy sản</span>
            </h1>
            <p className="text-on-primary-container/90 text-lg max-w-md">
              Tham gia cộng đồng chuyên gia và tối ưu hóa hệ thống trại giống của bạn với dữ liệu chính xác và công nghệ quản lý tiên tiến.
            </p>
          </div>
          <div className="mt-12 z-10">
            <div className="flex -space-x-4 mb-4">
              <img
                className="w-12 h-12 rounded-full border-2 border-primary-container object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGIIukz_CXcowbwf2NqSj14RfpQxuVAzFh76eTkAuxYskP7dlKTLPLI6EDguvAVzrHH-TtKcNl5bMw7iINEHgcacaEN2Y_CDAR6CoHkHuLhgRzxj_AhaRFoDQ5znJWoWIXxeWcYfq22zL3UYU44hHk8A9qjuBYCH2YyxjVusIxs3IY31CVwP_UDfnek6fQX-oRK9Zy-WPlIseBJ6wQKrdmKNUgQredcT0yviRAye3ZYcdZGnG5XvY1Pbru-s1fucf3h653UQwwtTKs"
                alt="marine biologist"
              />
              <img
                className="w-12 h-12 rounded-full border-2 border-primary-container object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHNS2j3OvrOo65TcMvR4ngRJfYIuTEmsv5jwcYqtQvwchrFyA2gyf5t1dsMdQxcm17xj2zgzCYPZSyOpd8M2e9zMvxfmkc39kDJuItzHX8octJM6IisY091n0gGRrIFxmJRJzjy8qD4Pyw8ESxaXLmhIVjbdA8PwLNEKEn2a78uQxrqDgSlImqkpz-Dz8xq4GrmW-69u4-PhleiAojQ342ey4t3oxLrqzS_JMAADax3p2g-TwVTnRo38A5_5cEMzrz6QM0BmneXnth"
                alt="hatchery technician"
              />
              <img
                className="w-12 h-12 rounded-full border-2 border-primary-container object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6CNIDL9aAHD81EXQcwcZagm-xua9vpm4uFnDcB-czXnnOPnuNNZF51XAee_U2W-JSA_Z1PeVpesSDRt9iacfaJfTnaZlirRNOFw5nB_PNyqmpLQQMCyPYOSGdK3p2xTe22pRKA6hLuQgHPuus-NC11mrb6DMzRoZMjKFoN1wBuDw_SjkZjYRHxpKgHxUAT37pP1j023_T5Ywk67N3kJxM2WEiR28LZcwgh-6091cQnDGvvAKmzWXa4cRPQLxGRLfJrB--ubaBNByL"
                alt="aquaculture specialist"
              />
            </div>
            <p className="text-white text-sm font-medium tracking-wide">GIA NHẬP +500 TRẠI GIỐNG TOÀN CẦU</p>
          </div>
          {/* Abstract fluid background for the left panel */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90"></div>
            <img
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVvM7Z7mlCQhoLuF82noqtmfFRrK2Z_T5rAuq6RKAZd90vD35RVUmGCDRUInQTeUvnSm98GLTD3m-I9547fVI4a4Hq2OBkmF0ARv1do2YKZo4RZmnzixjfThpHrM8FdEgrYgaaUcOMau-SWQso6XUZjpLUa1ST35M8cPKiz7-cWIIzLwUucRnKUNDkkeOgolCQx-GauHPTEAvH0dj0ctJi1ukC3QsvyqEtcBcYZACPJT7puM33EhKS9bD_r6y3wjp0Cd6FCozes55W"
              alt="water background"
            />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 bg-surface-container-lowest">
          <div className="max-w-md mx-auto">
            <header className="mb-8">
              <h2 className="text-2xl font-headline font-bold text-primary mb-2">Đăng nhập tài khoản</h2>
              <p className="text-slate-500 text-sm">Chào mừng quay trở lại. Hãy đăng nhập để tiếp tục hành trình nuôi trồng thủy sản.</p>
            </header>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Username/Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="identifier">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
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
                      if (error) {
                        setError(null);
                      }
                    }}
                  />
                </div>
                {validationErrors.identifier ? (
                  <p className="text-error text-xs px-1">{validationErrors.identifier}</p>
                ) : null}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: "" }));
                      }
                      if (error) {
                        setError(null);
                      }
                    }}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                    type="button"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {validationErrors.password ? (
                  <p className="text-error text-xs px-1">{validationErrors.password}</p>
                ) : null}
              </div>

              {/* Submit Button */}
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-headline font-bold text-lg shadow-[0_8px_20px_-4px_rgba(0,66,83,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(0,66,83,0.4)] transition-all transform active:scale-[0.98] cursor-pointer"
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
            <div className="relative my-8 flex items-center">
              <div className="grow border-t border-outline-variant/30"></div>
              <span className="mx-4 text-xs font-bold uppercase tracking-widest text-outline">
                Hoặc tiếp tục với
              </span>
              <div className="grow border-t border-outline-variant/30"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 gap-4">
              <button
                className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-outline-variant/30 rounded-full hover:bg-slate-50 transition-all cursor-pointer group"
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
            <div className="mt-8 pt-8 border-t border-surface-container-high text-center">
              <p className="text-slate-500 text-sm">
                Chưa có tài khoản?
                <Link
                  className="text-primary font-bold ml-1 hover:underline"
                  href={`/auth/register?next=${encodeURIComponent(nextUrl)}`}
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
