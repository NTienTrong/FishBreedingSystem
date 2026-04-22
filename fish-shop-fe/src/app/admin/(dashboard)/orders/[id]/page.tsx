export default function AdminOrderDetailsPage() {
  return (
    <div className="p-8 min-h-screen pb-32">
      {/* Action Bar: Sticky Bottom (Usually placed at the bottom, but in NextJs we can just place it fixed) */}
      <div className="fixed bottom-8 left-[calc(16rem+2rem)] right-8 z-50 bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-tight">ĐANG XỬ LÝ</span>
          <p className="text-sm font-medium text-on-surface-variant">Thao tác cuối cùng: <span className="text-on-surface">Cập nhật lúc 09:45 AM</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full text-error border border-error/30 font-bold text-sm hover:bg-error/5 transition-colors">Hủy đơn</button>
          <button className="px-6 py-2.5 rounded-full bg-surface-container-highest text-on-surface font-bold text-sm hover:bg-surface-dim transition-colors">Hoàn thành</button>
          <button className="px-6 py-2.5 rounded-full bg-secondary text-white font-bold text-sm hover:opacity-90 transition-opacity">Chuyển sang giao hàng</button>
          <button className="px-8 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">Phê duyệt đơn</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-32">
        {/* Order Summary Bento */}
        <div className="col-span-8 grid grid-cols-2 gap-6">
          {/* Primary Details */}
          <div className="bg-surface-container-low rounded-3xl p-8 col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <span className="material-symbols-outlined text-6xl text-primary/5 group-hover:scale-110 transition-transform duration-500">receipt_long</span>
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-primary mb-2">Đơn hàng #ORD-8892</h2>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> 14 Tháng 10, 2023</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 08:22 AM</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Khách hàng</p>
                  <p className="font-bold text-on-surface">Nguyễn Văn A</p>
                  <p className="text-sm text-on-surface-variant">+84 901 234 567</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Địa chỉ giao hàng</p>
                  <p className="text-sm text-on-surface leading-relaxed">123 Đường Ven Biển, Phường Thắng Tam, TP. Vũng Tàu</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Phương thức</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">VNPAY</span>
                    <span className="text-sm text-on-surface">Thanh toán Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Info Card */}
          <div className="bg-surface-container-highest rounded-3xl p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">account_balance</span>
                Giao dịch VNPay
              </h3>
              <span className="material-symbols-outlined text-green-600">verified_user</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">Mã tham chiếu</span>
                <span className="text-sm font-mono font-medium">VNP-99882211</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">Ngân hàng</span>
                <span className="text-sm font-medium">Vietcombank</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">Số tiền</span>
                <span className="text-lg font-extrabold text-primary">12.500.000 ₫</span>
              </div>
              <div className="pt-4 border-t border-outline-variant/20">
                <div className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                  Thanh toán thành công
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Preview Card */}
          <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 opacity-10">
              <span className="material-symbols-outlined text-[120px]">local_shipping</span>
            </div>
            <h3 className="font-bold mb-6 flex items-center gap-2 text-primary-fixed">
              <span className="material-symbols-outlined">route</span>
              Trạng thái Vận chuyển
            </h3>
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/20">
              <div className="relative">
                <span className="absolute -left-6 top-1 w-3 h-3 bg-white rounded-full border-2 border-primary"></span>
                <p className="text-xs font-bold opacity-70">08:00 AM - 14/10</p>
                <p className="text-sm">Đã tiếp nhận tại Trạm giống DeepStream</p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-1 w-3 h-3 bg-primary-fixed rounded-full border-2 border-primary"></span>
                <p className="text-xs font-bold text-primary-fixed">Dự kiến: 02:00 PM</p>
                <p className="text-sm">Giao hàng cho Nguyễn Văn A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Table Section */}
        <div className="col-span-4 bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Chi tiết sản phẩm</h3>
          <div className="flex-1 space-y-6">
            {/* Item */}
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-surface-container-high rounded-2xl overflow-hidden flex-shrink-0">
                <img alt="Cá giống" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuxtM0SFi5gUzs4RoUmoTC3onug3r0Gd8cBCuOlaF43Eox1A-m8x5cNFZb7vJNcKkVOtw5wi7lXzr7brJ5lHXlZa7FdjGa793_rP2lxCTG0jxWoUUK59i3OVHb5ce4IRnBdtt2vfWYTvtEwErlG4FO1tm20sDfd2uONmGQNeEoviS4feOJ-J3sfYviAWMgypogMobPIZq5kc3_2o1J1tst9zRkgUzhPHNBMf1JL2GSHFljXehIMoOW1ZDDKftUPBF-xwgxo3eMuZXD" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-on-surface text-sm">Cá Chẽm Giống Công Nghệ Cao</h4>
                <p className="text-xs text-on-surface-variant mt-1">Size: 2-3cm | Loại: A1</p>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-xs text-on-surface-variant">2,000 con x 4.500 ₫</p>
                  <p className="font-bold text-primary text-sm">9.000.000 ₫</p>
                </div>
              </div>
            </div>
            {/* Item */}
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-surface-container-high rounded-2xl overflow-hidden flex-shrink-0">
                <img alt="Thức ăn" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1O2g0FR_uBQ7JPBv5jcbio7U2hg0Bpdb21TmLBCwHCgNoz5J37nqyS9lmEIo9iyZsit_fub5CNpk9i1ODIZabLdQLfxrZGg3UJIpfLhPl5_KgkKOG6Mt42__uVDdkgpC571ag0_7c3g0jJEtgrq9h6Wp7tbW19rDYlV6PYij_xdck0Q_S3t1H4yZLHfcAJgXgGT0miUZPzF0UsDcnaZhmtpXESaNIRKyKmxw_RdLFHUm5-Vd8UmxsvKjA8EwTpU5rCZbBEodYxtlX" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-on-surface text-sm">Thức Ăn Tăng Trưởng DeepGrowth</h4>
                <p className="text-xs text-on-surface-variant mt-1">Bao: 25kg | Đạm: 45%</p>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-xs text-on-surface-variant">5 bao x 700.000 ₫</p>
                  <p className="font-bold text-primary text-sm">3.500.000 ₫</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant/30 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Tạm tính</span>
              <span className="font-medium">12.500.000 ₫</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Phí vận chuyển</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-primary/10">
              <span className="font-bold text-on-surface">Tổng cộng</span>
              <span className="font-headline text-2xl font-extrabold text-primary tracking-tight">12.500.000 ₫</span>
            </div>
          </div>
        </div>

        {/* Logistics Map Section: Full Width */}
        <div className="col-span-12">
          <div className="bg-surface-container-low rounded-[2rem] overflow-hidden">
            <div className="px-8 py-6 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">map</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-primary">Bản đồ điều hướng Logistics</h3>
                  <p className="text-xs text-on-surface-variant">Cập nhật vị trí thực tế của lô hàng giống</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-outline-variant/10">
                <span className="material-symbols-outlined text-tertiary">location_on</span>
                <span className="text-xs font-bold">Lộ trình: Vũng Tàu - DeepStream Hatchery</span>
              </div>
            </div>
            <div className="relative h-[450px] w-full">
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-slate-200">
                <img alt="Bản đồ" className="w-full h-full object-cover grayscale opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7XU2iOpfmtgqQnJUR4tWyEDI9gGgQb2HoPCJMg7RP3MflpZfZj1y-6q-nZ-EnDHzy9zCCvJ7T2Y4NyMAW9y9DkLlQAa24tqDA6-Oac0Gw9X2hlHd_QYxvxygJAkJeWnz8ikjoMz9tF9bFDlk7AA9fZ4ta5kM07xm5bDHpfMRz0EwTfFqmR7te62fBg7u3kUQUL-T183ZRWD41BRs-JWxbLydV8lqkHPi_q_pi1Q7WIqvEhir-7GibTikKkefKfYhpzYsrH0qwcpd1" />
                {/* Custom Map Layer Overlays */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
                    <path className="drop-shadow-lg" d="M200 200C300 150 450 250 600 200C750 150 850 200 900 250" stroke="#004253" strokeDasharray="10 10" strokeWidth="4"></path>
                    {/* Hatchery Pin */}
                    <circle cx="200" cy="200" fill="#004253" r="12"></circle>
                    <circle cx="200" cy="200" r="25" stroke="#004253" strokeOpacity="0.2" strokeWidth="2"></circle>
                    {/* Delivery Pin */}
                    <circle cx="900" cy="250" fill="#5c3200" r="12"></circle>
                    <circle cx="900" cy="250" r="25" stroke="#5c3200" strokeOpacity="0.2" strokeWidth="2"></circle>
                  </svg>
                </div>
                {/* Floating Map Controls */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-on-surface">add</span>
                  </button>
                  <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-on-surface">remove</span>
                  </button>
                </div>
                <div className="absolute bottom-6 left-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">water_drop</span>
                    </div>
                    <p className="text-xs font-bold text-primary">Điều kiện vận chuyển</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase">Nhiệt độ</p>
                      <p className="text-sm font-bold text-on-surface">24.5 °C</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase">Độ pH</p>
                      <p className="text-sm font-bold text-on-surface">7.8</p>
                    </div>
                  </div>
                </div>

                {/* Marker Labels */}
                <div className="absolute top-[160px] left-[170px] bg-primary text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-md">HATCHERY BASE</div>
                <div className="absolute top-[280px] left-[870px] bg-tertiary text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-md">KHÁCH HÀNG</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
