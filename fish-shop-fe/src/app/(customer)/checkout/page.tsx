"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CustomerProfile = {
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile>({});
  const [error, setError] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const ensureSession = async () => {
      const sessionResponse = await fetch("/api/customer/auth/session");
      if (!sessionResponse.ok) {
        router.replace("/auth/login?returnUrl=/checkout");
        return;
      }

      try {
        const meResponse = await fetch("/api/customer/me", { cache: "no-store" });
        if (meResponse.ok) {
          const data = (await meResponse.json()) as CustomerProfile;
          setProfile({
            fullName: data.fullName ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    ensureSession();
  }, [router]);

  const handleConfirmOrder = async () => {
    if (!profile.fullName?.trim() || !profile.phone?.trim() || !profile.address?.trim()) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ trước khi đặt hàng.");
      return;
    }

    try {
      setUpdatingProfile(true);
      setError(null);

      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName?.trim(),
          phone: profile.phone?.trim(),
          address: profile.address?.trim(),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Không thể cập nhật thông tin khách hàng.");
      }

      // TODO: gọi API tạo đơn hàng khi backend sẵn sàng
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật thông tin khách hàng.";
      setError(message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-2">Hoàn tất đặt hàng</h1>
        <p className="text-on-surface-variant font-body">Vui lòng kiểm tra thông tin vận chuyển và chọn phương thức thanh toán.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-error/10 text-error text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* 3-Column Bento/Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: Shipping Info (Span 5) */}
        <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-fixed">local_shipping</span>
            </div>
            <h2 className="text-xl font-bold text-primary">Thông tin giao hàng</h2>
          </div>
          
          <form className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1" htmlFor="name">
                Họ và tên
              </label>
              <input
                className="w-full bg-surface-container-highest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                id="name"
                placeholder="Nguyễn Văn A"
                type="text"
                value={profile.fullName ?? ""}
                onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                disabled={loadingProfile}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1" htmlFor="phone">
                Số điện thoại
              </label>
              <input
                className="w-full bg-surface-container-highest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                id="phone"
                placeholder="090 123 4567"
                type="tel"
                value={profile.phone ?? ""}
                onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                disabled={loadingProfile}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1" htmlFor="address">
                Địa chỉ chi tiết
              </label>
              <textarea
                className="w-full bg-surface-container-highest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                id="address"
                placeholder="Số nhà, tên đường, phường/xã..."
                rows={3}
                value={profile.address ?? ""}
                onChange={(event) => setProfile((prev) => ({ ...prev, address: event.target.value }))}
                disabled={loadingProfile}
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
                  Tỉnh / Thành phố
                </label>
                <select className="w-full bg-surface-container-highest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none">
                  <option>Hồ Chí Minh</option>
                  <option>Hà Nội</option>
                  <option>Đà Nẵng</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
                  Quận / Huyện
                </label>
                <select className="w-full bg-surface-container-highest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none">
                  <option>Quận 1</option>
                  <option>Quận 7</option>
                  <option>Bình Thạnh</option>
                </select>
              </div>
            </div>
          </form>
        </section>

        {/* Column 2: Payment Method (Span 3) */}
        <section className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-fixed">payments</span>
            </div>
            <h2 className="text-xl font-bold text-primary">Thanh toán</h2>
          </div>
          
          <div className="space-y-4">
            {/* Selected: VNPay */}
            <label className="relative flex items-center p-4 rounded-xl cursor-pointer border-2 border-primary bg-primary/5 transition-all">
              <input checked className="hidden" name="payment" type="radio" value="vnpay" readOnly />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  <span className="font-bold text-primary">VNPay</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                </div>
              </div>
            </label>
            
            {/* Unselected Options */}
            <label className="relative flex items-center p-4 rounded-xl cursor-pointer border-2 border-transparent bg-surface-container-low hover:bg-surface-container-high transition-all">
              <input className="hidden" name="payment" type="radio" value="momo" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">qr_code_2</span>
                  <span className="font-medium text-on-surface-variant">Ví MoMo</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant"></div>
              </div>
            </label>
            
            <label className="relative flex items-center p-4 rounded-xl cursor-pointer border-2 border-transparent bg-surface-container-low hover:bg-surface-container-high transition-all">
              <input className="hidden" name="payment" type="radio" value="cod" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">handshake</span>
                  <span className="font-medium text-on-surface-variant">Tiền mặt (COD)</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant"></div>
              </div>
            </label>
          </div>
          
          <div className="mt-8 p-4 rounded-lg bg-surface-container-low">
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Bạn sẽ được chuyển hướng đến cổng thanh toán bảo mật của VNPay để hoàn tất giao dịch.
            </p>
          </div>
        </section>

        {/* Column 3: Order Summary (Span 4) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-primary text-on-primary rounded-xl p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] relative overflow-hidden">
            {/* Background texture/flare */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">receipt_long</span>
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-4 border-b border-white/10 pb-6 mb-6">
              <div className="flex justify-between items-center opacity-80">
                <span className="text-sm">Cá Dĩa Blue Diamond (x2)</span>
                <span className="font-medium">1.200.000đ</span>
              </div>
              <div className="flex justify-between items-center opacity-80">
                <span className="text-sm">Hệ thống lọc Bio-Smart</span>
                <span className="font-medium">450.000đ</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-sm opacity-80">
                <span>Tạm tính</span>
                <span>1.650.000đ</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-80">
                <span>Phí vận chuyển (Ưu tiên)</span>
                <span>45.000đ</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/20">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-2xl font-black text-secondary-fixed">1.695.000đ</span>
              </div>
            </div>
            
            <button
              className="w-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim transition-colors py-4 rounded-full font-bold flex items-center justify-center gap-2 group disabled:opacity-60"
              onClick={handleConfirmOrder}
              type="button"
              disabled={updatingProfile || loadingProfile}
            >
              {updatingProfile ? "Đang cập nhật..." : "Xác nhận đặt hàng"}
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
            <p className="text-center text-[10px] mt-4 opacity-60 uppercase tracking-widest font-bold">
              Đảm bảo vận chuyển sinh vật an toàn 100%
            </p>
          </div>
          
          {/* Featured item for upselling or confidence */}
          <div className="bg-surface-container-low rounded-xl p-4 flex gap-4 items-center">
            <img
              className="w-20 h-20 rounded-lg object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsWkEKlD0z5alqETzb8t1jFLv2lhZLyNz9a5u_ejKKrpWJt-_cXtjYmI6HeNDiZyCFU9kkP522pZQDOKHfEfbbQCmw3tLFPS5VIlxfkNxzkubQpIVNMe3ldAmkcqahtbQ2GgC8bZ0irK-1Dessr9U7lVqBCGA0546QysxF6-Y97KVFqyjBNkTsUHpJuvfd9jL4GMYtbvc9MyKb5hO9D5193vtjCUiqFQVsKWOqrl9lxEyE6Z6J6s_oJX8aWE6c43F3aNoGkc3NPfl1"
              alt="Hatchery Standards"
            />
            <div>
              <h4 className="font-bold text-sm text-primary">Chứng chỉ Hatchery Standards</h4>
              <p className="text-xs text-on-surface-variant mt-1">Đã kiểm dịch và đóng gói theo tiêu chuẩn quốc tế.</p>
            </div>
          </div>
          
          <div className="bg-surface-container-low rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-symbols-outlined text-secondary">support_agent</span>
              <span className="text-sm font-bold text-primary">Hỗ trợ kỹ thuật 24/7</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Mọi thắc mắc về kỹ thuật vận chuyển hoặc chăm sóc sau khi nhận cá, vui lòng liên hệ Hotline: <span className="font-bold text-primary">1900 88xx</span>.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
