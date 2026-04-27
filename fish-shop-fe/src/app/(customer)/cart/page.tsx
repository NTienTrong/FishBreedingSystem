import Link from "next/link";

export default function CartPage() {
  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      {/* Hero Header */}
      <section className="mb-12">
        <h1 className="font-display font-black text-5xl md:text-6xl text-primary tracking-tighter mb-4">
          Giỏ hàng của bạn
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg">
          Quản lý các mẫu sinh học và thiết bị nuôi trồng thủy sản chính xác của bạn trước khi xác nhận đơn hàng.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product List Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cart Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 px-6 py-4 text-sm font-bold text-on-surface-variant tracking-widest uppercase">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-2 text-center">Giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Tổng</div>
          </div>

          {/* Product Row 1 */}
          <div className="bg-surface-container-low rounded-xl p-6 transition-all hover:bg-surface-container-high group">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="col-span-1 md:col-span-6 flex gap-6 items-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3Tp2n1j_IIFLReo_lJBSW8r9R7SOrZ-dUd4xyALMiaqPUC3U-b-frUNE1-5PEHSwUQonKxnDhk1SKy0Ej0vrPP5aO4l3qmFaNg_LFwRrL6Tz_BIdRW8OsLFYLLdOIDgHH7mkbYH9S_bC0mHkiFZvlCnxiLlM1-gK4UbaiMxDL0Tzd1vNwam9jQMF3YmrupzFeMYCSrFCAx03igQPOHPiKkTq_X4wHYzz5BdMhjRe1ISubSehcT3ell4wpPNhtncQJ4HGoN3Sqe_rC"
                    alt="Blue discus fish"
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-primary mb-1">Cá Đĩa Red Turquoise</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Mã: FS-8829-BL</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded uppercase tracking-wider">
                      Hạng A+
                    </span>
                    <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold rounded uppercase tracking-wider">
                      Nhiệt đới
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 text-center">
                <span className="text-on-surface font-semibold">1.200.000 ₫</span>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-center">
                <div className="flex items-center bg-surface-container-highest rounded-full px-3 py-1 gap-4">
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg leading-none">remove</span>
                  </button>
                  <span className="font-bold text-primary w-4 text-center">2</span>
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg leading-none">add</span>
                  </button>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 text-right">
                <span className="text-primary font-extrabold text-lg">2.400.000 ₫</span>
              </div>
            </div>
          </div>

          {/* Product Row 2 */}
          <div className="bg-surface-container-low rounded-xl p-6 transition-all hover:bg-surface-container-high group">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="col-span-1 md:col-span-6 flex gap-6 items-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuEdl-SAfTUv9RbsMhrdWEuox4JLsFKNBbrH1NOx5_Vu66yiIs2ipDamH5Fw9iuhDjH7wsp6Eo86qCAvHghLpJWyKqhAWAUgxQ2aUHl7ZPU5aLKvaF85o7CCpE55uupviYV1k3QQyywX5HH3aOzYokNZYXMwKfCQ4t461N6rAdmBg5Ypci1MtBL5aFnQxxBLPrRq3Zni1GI-S39ceCGd_yIOZSYOyy4wsw8gPRkLEESInwKlsnJaEhq7ogt2KO8ZvbtV5S1qslxx22"
                    alt="Bio-Precision 500"
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-primary mb-1">Hệ thống lọc Bio-Precision 500</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Mã: FS-EQ-502</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded uppercase tracking-wider">
                      Cảm biến Smart
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 text-center">
                <span className="text-on-surface font-semibold">3.500.000 ₫</span>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-center">
                <div className="flex items-center bg-surface-container-highest rounded-full px-3 py-1 gap-4">
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg leading-none">remove</span>
                  </button>
                  <span className="font-bold text-primary w-4 text-center">1</span>
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg leading-none">add</span>
                  </button>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 text-right">
                <span className="text-primary font-extrabold text-lg">3.500.000 ₫</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-between items-center pt-6">
            <Link href="/products" className="flex items-center gap-2 text-secondary font-bold hover:gap-4 transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-grow">
                <input
                  className="w-full md:w-64 bg-surface-container-highest border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                  placeholder="Mã giảm giá"
                  type="text"
                />
              </div>
              <button className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-bold text-sm hover:brightness-95 transition-all">
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 sticky top-32 shadow-[0_20px_40px_rgba(25,28,30,0.06)] border border-white/50">
            <h2 className="font-display font-black text-2xl text-primary mb-8 tracking-tight">Chi tiết thanh toán</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium">Tạm tính</span>
                <span className="font-bold">5.900.000 ₫</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium">Phí vận chuyển thủy sinh</span>
                <span className="font-bold">150.000 ₫</span>
              </div>
              <div className="flex justify-between items-center text-secondary">
                <span className="font-medium">Giảm giá mã voucher</span>
                <span className="font-bold">- 0 ₫</span>
              </div>
            </div>
            
            <div className="h-px bg-outline-variant/15 mb-6"></div>
            
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-xs uppercase font-black tracking-widest text-on-surface-variant mb-1">
                  Tổng cộng
                </p>
                <p className="text-3xl font-black text-primary tracking-tighter">6.050.000 ₫</p>
              </div>
              <span className="material-symbols-outlined text-secondary opacity-50">verified_user</span>
            </div>
            
            <Link
              href="/checkout"
              className="w-full py-5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-display font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Tiến hành thanh toán
              <span className="material-symbols-outlined">payments</span>
            </Link>
            
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                <span className="material-symbols-outlined text-secondary">local_shipping</span>
                <div className="text-xs">
                  <p className="font-bold text-on-surface">Vận chuyển chuyên dụng</p>
                  <p className="text-on-surface-variant">Đảm bảo cá khỏe mạnh 100% khi đến nơi.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                <span className="material-symbols-outlined text-secondary">security</span>
                <div className="text-xs">
                  <p className="font-bold text-on-surface">Thanh toán bảo mật</p>
                  <p className="text-on-surface-variant">Hệ thống FishSync bảo mật 256-bit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
