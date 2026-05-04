"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/app/config/api";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState("/");

  const welcomeMessage = `Chào mừng ${fullName.trim()} đến với FishSync! Khám phá cá giống ngay.`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextUrl(params.get("returnUrl") || params.get("next") || "/");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || null,
          address: address.trim() || null,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Đăng ký thất bại.");
      }

      const data = (await response.json()) as { token: string; role: string };

      const sessionResponse = await fetch("/api/customer/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token, role: data.role }),
      });

      if (!sessionResponse.ok) {
        const sessionMessage = await sessionResponse.text();
        throw new Error(sessionMessage || "Không thể khởi tạo phiên đăng nhập.");
      }

      sessionStorage.setItem("welcomeMessage", welcomeMessage);
      window.dispatchEvent(new Event("customer-session-updated"));
      router.push(nextUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng ký thất bại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
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
              <h2 className="text-2xl font-headline font-bold text-primary mb-2">Tạo tài khoản mới</h2>
              <p className="text-slate-500 text-sm">Bắt đầu hành trình quản lý thủy sản chuyên nghiệp ngay hôm nay.</p>
            </header>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="full_name">
                  Họ và tên
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
                    id="full_name"
                    name="full_name"
                    placeholder="Nguyễn Văn A"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
                    id="email"
                    name="email"
                    placeholder="example@fishsync.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="phone">
                  Số điện thoại
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                    call
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
                    id="phone"
                    name="phone"
                    placeholder="090 123 4567"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="address">
                  Địa chỉ
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                    location_on
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
                    id="address"
                    name="address"
                    placeholder="Số nhà, tên đường..."
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
              </div>

              {/* Password Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
                      lock
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="confirm_password">
                    Xác nhận
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
                      shield
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-high border-0 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none"
                      id="confirm_password"
                      name="confirm_password"
                      placeholder="••••••••"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3 py-2">
                <input
                  className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                  id="terms"
                  name="terms"
                  type="checkbox"
                />
                <label className="text-sm text-slate-600 leading-snug" htmlFor="terms">
                  Tôi đồng ý với các <Link href="#" className="text-primary font-semibold hover:underline">Điều khoản dịch vụ</Link> và <Link href="#" className="text-primary font-semibold hover:underline">Chính sách bảo mật</Link> của FishSync.
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-headline font-bold text-lg shadow-[0_8px_20px_-4px_rgba(0,66,83,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(0,66,83,0.4)] transition-all transform active:scale-[0.98]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-xl bg-error/10 text-error text-sm px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-surface-container-high text-center">
              <p className="text-slate-500 text-sm">
                Đã có tài khoản? 
                <Link href={`/auth/login?next=${encodeURIComponent(nextUrl)}`} className="text-primary font-bold hover:underline ml-1">Đăng nhập ngay</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
