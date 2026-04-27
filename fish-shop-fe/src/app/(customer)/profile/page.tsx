import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <header className="mb-12 relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 text-label-md text-on-surface-variant mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary font-semibold">Tài khoản của tôi</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">Quản Lý Đơn Hàng</h1>
            <p className="mt-2 text-on-surface-variant font-medium">Theo dõi tình trạng các mẫu vật thủy sinh đang được vận chuyển.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-surface-container-high px-6 py-4 rounded-xl flex items-center gap-4">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">package_2</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tổng đơn hàng</p>
                <p className="text-xl font-black text-primary">24</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Order List View */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 flex items-center justify-between border-b border-outline-variant/15">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">list_alt</span>
                Lịch sử đặt hàng
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-white">Tất cả</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-high">
                  Đang xử lý
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mã đơn hàng</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ngày đặt</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tổng cộng</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr className="hover:bg-white transition-colors cursor-pointer group">
                    <td className="px-6 py-5 font-bold text-primary">#FS-88219</td>
                    <td className="px-6 py-5 text-on-surface-variant">12 Th04, 2024</td>
                    <td className="px-6 py-5 font-semibold">12,450,000₫</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Delivered
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                        arrow_forward_ios
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-surface-container-highest/30 transition-colors cursor-pointer group border-l-4 border-primary">
                    <td className="px-6 py-5 font-bold text-primary">#FS-89042</td>
                    <td className="px-6 py-5 text-on-surface-variant">Hôm nay</td>
                    <td className="px-6 py-5 font-semibold">8,200,000₫</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        Shipping
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="material-symbols-outlined text-primary">visibility</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white transition-colors cursor-pointer group">
                    <td className="px-6 py-5 font-bold text-primary">#FS-87550</td>
                    <td className="px-6 py-5 text-on-surface-variant">28 Th03, 2024</td>
                    <td className="px-6 py-5 font-semibold">4,120,000₫</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                        arrow_forward_ios
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Map Component (Custom Delivery Tracking) */}
          <div className="bg-surface-container-low rounded-2xl p-6 relative overflow-hidden group h-[300px]">
            <div className="absolute inset-0 z-0">
              <img
                className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-30 transition-opacity"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCqFGlE7qySBeKTe_z9rbal2S8WoPBYcSgQzfG2oUq3hONc9fyxLZOZTlsBk5I6oao_K8mkKkheZDLZhZyKgybl6aZ_NAdu-2M_X1WY6713h7OxyEVrP7Ap70vayKnAm_ZahExzMtDFtwHIIVgHSA7ypzLawnPCevT1nmLOcdpDN3K0WaaeyvcIvpT6HFlbexPosN74i44aVDXkZ1-MzmVSHjVdvvCgX1aBpa3wB0kdw9qJf_8_Rue7tZWTaxa0clfOgJ82Tw4ISAf"
                alt="map tracking"
              />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-primary">Theo dõi trực tiếp</h3>
                  <p className="text-sm text-on-surface-variant">Đơn hàng #FS-89042 đang di chuyển</p>
                </div>
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary border border-primary/10">
                  Dự kiến: 2 ngày tới
                </span>
              </div>
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20">
                <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div className="flex-1">
                  <div className="h-1.5 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant">Hatchery Hub</span>
                    <span className="text-[10px] font-bold uppercase text-primary">Trạm phân phối Sài Gòn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order Detail View (Active/Selected Order) */}
        <section className="lg:col-span-1">
          <div className="sticky top-28 bg-surface-container-lowest rounded-2xl p-6 shadow-[0_20px_40px_rgba(25,28,30,0.06)] border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Chi tiết đơn hàng</p>
                <h2 className="text-2xl font-black text-primary">#FS-89042</h2>
              </div>
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>
            <div className="space-y-6">
              {/* Purchased Item 1 */}
              <div className="flex gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHkBrPddhKybXLqk8bqqkOCkdIuhtsGVqAYswEX6-m532OV_fTjdBdcerj_1ivS8hH0xzKAH__HYpIseih1Fmzkb20qBwHZVQSzynUWQOVhMFDdW4OfATpomw96FZEUUp5Bp9a7b44CrSP31N9nQlVrJ24HGkZPPPqN3OZvabJdm_t0qTvxz60e0YKeZ-KSNmxh_-s7aJQOn6fsJLLj_vzieHcTXk3FF4PkbME6UMXZ_IAwecyUfJ9ETTij7hxPdHzSQChiAp9KzTS"
                    alt="Blue Betta"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-primary text-sm leading-tight">Blue Marble Betta (Grade A+)</h4>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xs font-medium text-on-surface-variant">SL: 02</span>
                    <span className="font-bold text-primary">3,200,000₫</span>
                  </div>
                </div>
              </div>
              {/* Purchased Item 2 */}
              <div className="flex gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrL_i6Qqgive-J1eEGU8ApUnPerh0NX6kzXfEOU4l-H-1ioYlaW26ijtXNf6i5-ZTqbZDMSteCVrm9vsOUsJ0HNgR2KzCsg2Xr_GPBtXLQr6UtYDo5FvjTZmRg2C96sMX9ezdjWgAjtwsTXg0MmFjJXMvRXsJkmL7__1nGKYXz0GG8ORFSqzZ2IL68d34WKrwZfkkr0PVWncaygG_vS4t9bhLbyLKvWualSch0jNMuwcIQRDavrNJqcmpiVtc0UoGmGrEvFv-Ey5G1"
                    alt="Neon Tetra"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-primary text-sm leading-tight">Neon Tetra Premium XL</h4>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xs font-medium text-on-surface-variant">SL: 50</span>
                    <span className="font-bold text-primary">5,000,000₫</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/15 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Tạm tính</span>
                  <span className="font-semibold">8,200,000₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Phí vận chuyển (Bảo ôn)</span>
                  <span className="text-secondary font-bold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-xl font-black text-primary pt-3">
                  <span>Tổng cộng</span>
                  <span>8,200,000₫</span>
                </div>
              </div>

              <div className="bg-primary-container/10 p-4 rounded-xl border border-primary-container/20">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-container mt-0.5">info</span>
                  <div>
                    <p className="text-xs font-bold text-primary mb-1">Ghi chú kỹ thuật</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Đơn hàng bao gồm túi oxy nén và đá gel giữ nhiệt 24h. Vui lòng kiểm tra pH ngay khi nhận hàng.
                    </p>
                  </div>
                </div>
              </div>
              <button className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                Liên hệ hỗ trợ kỹ thuật
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
