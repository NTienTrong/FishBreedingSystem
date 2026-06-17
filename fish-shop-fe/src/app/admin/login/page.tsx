"use client";

import React, { useEffect, useState } from "react";
import '@/app/globals.css';
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    if (message === "session_expired") {
      setSessionMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8083/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();

      const sessionResponse = await fetch("/api/admin/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: data.token,
          role: data.role,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error("Không thể tạo phiên đăng nhập an toàn.");
      }

      router.push("/admin");
      router.refresh();

    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-['Inter'] selection:bg-cyan-200 selection:text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-[0_30px_80px_-35px_rgba(6,182,212,0.6)] backdrop-blur-xl">
          <div className="grid md:grid-cols-2">
            <section className="relative hidden md:flex flex-col justify-between bg-linear-to-br from-cyan-500/15 via-teal-500/15 to-slate-900 p-10 lg:p-12">
              <div>
                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-200 ring-1 ring-cyan-200/30">
                  <span className="material-symbols-outlined text-3xl">water_drop</span>
                </div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Fish Breeding Control</p>
                <h1 className="mt-4 font-['Manrope'] text-4xl font-extrabold tracking-tight text-white">
                  Admin Portal
                </h1>
                <p className="mt-5 max-w-sm text-sm leading-7 text-cyan-50/80">
                  Quản trị dữ liệu sản phẩm, đơn hàng và vận hành hệ thống trong một không gian bảo mật tập trung.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-cyan-50/80">
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-cyan-200">verified_user</span>
                  Tất cả phiên đăng nhập quản trị đều được kiểm tra quyền ADMIN.
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-cyan-200">network_locked</span>
                  Nhật ký truy cập được theo dõi để đảm bảo an toàn hệ thống.
                </p>
              </div>
            </section>

            <section className="p-7 sm:p-10 lg:p-12">
              <div className="mb-8 flex items-center gap-3 md:hidden">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-200">
                  <span className="material-symbols-outlined text-2xl">water_drop</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Fish Breeding Control</p>
                  <h1 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-white">Admin Portal</h1>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-white">
                  Đăng nhập quản trị
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Nhập thông tin tài khoản để truy cập trang điều hành hệ thống.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-300" htmlFor="username">
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      id="username"
                      name="username"
                      placeholder="Nhập tên đăng nhập"
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-300" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                    {error}
                  </div>
                )}

                {sessionMessage && !error && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-200">
                    {sessionMessage}
                  </div>
                )}

                <button
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-teal-500 px-6 py-3.5 font-['Manrope'] text-sm font-bold uppercase tracking-[0.14em] text-slate-950 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
                  {!isLoading && (
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500">
                Khu vực chỉ dành cho nhân sự có thẩm quyền quản trị.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center text-[11px] uppercase tracking-[0.12em] text-slate-500">
        2026 Fish Breeding System • Secure Admin Access
      </footer>
    </div>
  );
}
