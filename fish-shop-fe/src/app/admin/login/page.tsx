"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="bg-[#0f172a] blueprint-grid min-h-screen flex flex-col font-['Inter'] selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Main Content */}
      <main className="grow flex items-center justify-center p-6 md:p-12">
        <div className="relative w-full max-w-md">
          {/* Decorative Tech Accents */}
          <div className="absolute -top-12 -left-12 w-24 h-24 border-t-2 border-l-2 border-primary-fixed-dim/20"></div>
          <div className="absolute -bottom-12 -right-12 w-24 h-24 border-b-2 border-r-2 border-primary-fixed-dim/20"></div>

          {/* Central Card: Flat Design, Sharp Corners */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-10 md:p-14 relative z-10 shadow-2xl">

            {/* Brand & Header */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-surface text-4xl">water_drop</span>
              </div>
              <h1 className="font-['Manrope'] font-extrabold text-2xl text-primary tracking-tighter text-center">
                Hydro-Precision
              </h1>
              <span className="font-['Manrope'] font-medium text-on-surface-variant text-sm tracking-widest uppercase mt-2">
                Quản trị hệ thống
              </span>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block font-['Inter'] text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="username">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary py-4 px-4 font-['Inter'] text-on-surface placeholder:text-outline/50 transition-all duration-200 outline-none"
                    id="username"
                    name="username"
                    placeholder="admin"
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/40 text-sm">person</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-['Inter'] text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                    Mật khẩu
                  </label>
                  <Link className="text-[10px] text-secondary hover:text-primary font-bold uppercase transition-colors" href="#">Quên?</Link>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary py-4 px-4 font-['Inter'] text-on-surface placeholder:text-outline/50 transition-all duration-200 outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/40 text-sm">lock</span>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium text-center">
                  {error}
                </div>
              )}

              {sessionMessage && !error && (
                <div className="text-amber-600 text-sm font-medium text-center">
                  {sessionMessage}
                </div>
              )}

              <div className="pt-4">
                <button
                  className="w-full bg-primary hover:bg-black text-surface font-['Manrope'] font-bold text-sm py-4 px-8 tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
                  {!isLoading && <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </button>
              </div>
            </form>

            {/* Security Warning */}
            <div className="mt-12 pt-8 border-t border-outline-variant/10 flex gap-3">
              <span className="material-symbols-outlined text-error shrink-0">gpp_maybe</span>
              <p className="text-[11px] leading-relaxed text-on-surface-variant font-medium">
                Khu vực dành riêng cho nhân viên. Mọi hành vi truy cập trái phép sẽ bị ghi lại.
                <span className="block text-[10px] text-outline mt-1 italic">IP: 192.168.1.104 • AES-256 Encrypted</span>
              </p>
            </div>
          </div>

          {/* Technical Data Subtext */}
          <div className="mt-6 flex justify-between items-center text-[10px] text-primary-fixed-dim/40 font-mono tracking-tighter">
            <span>SYSTEM_STATUS: SECURE</span>
            <span>HATCHERY_OS v4.2.0</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-12 py-4 gap-4 bg-slate-100 dark:bg-slate-900 backdrop-blur-md tonal-transition absolute bottom-0">
        <div className="font-['Inter'] text-xs font-medium tracking-wide uppercase text-slate-600 dark:text-slate-400 opacity-80">
          © 2024 Hatchery Management Systems. Secure Admin Access Only.
        </div>
        <div className="flex gap-6">
          <Link className="font-['Inter'] text-xs font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-200 transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</Link>
          <Link className="font-['Inter'] text-xs font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-200 transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</Link>
          <Link className="font-['Inter'] text-xs font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-200 transition-all opacity-80 hover:opacity-100" href="#">Security Protocols</Link>
        </div>
      </footer>
    </div>
  );
}
