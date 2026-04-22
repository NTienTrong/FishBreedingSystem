export default function AdminTransactionsPage() {
  return (
    <div className="p-8 space-y-8 min-h-screen">
      {/* Summary Section (Asymmetric Bento Grid) */}
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-primary to-primary-container rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <p className="text-primary-fixed opacity-80 text-sm font-semibold tracking-widest uppercase mb-2">Tổng quan doanh thu</p>
            <h2 className="text-4xl font-extrabold tracking-tighter mb-6">
              452.800.000 <span className="text-xl font-normal opacity-70">VNĐ</span>
            </h2>
            <div className="flex gap-12">
              <div>
                <p className="text-xs text-primary-fixed opacity-70 mb-1">Tháng này</p>
                <p className="text-xl font-bold">
                  +12.5% <span className="material-symbols-outlined text-sm align-middle">trending_up</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-fixed opacity-70 mb-1">Giao dịch thành công</p>
                <p className="text-xl font-bold">1,429</p>
              </div>
              <div>
                <p className="text-xs text-primary-fixed opacity-70 mb-1">Tỷ lệ hoàn tất</p>
                <p className="text-xl font-bold">98.2%</p>
              </div>
            </div>
          </div>

          {/* Decorative Graphic */}
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
            <img className="h-full w-full object-cover mix-blend-overlay" alt="Graphic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGPDcNY3g-UBs1wYFMlEefqb8QjfZiTKPthe4q5WyolFTFVaDqGKRMW8NRSqSsfsoBwZ_hiTuf7egVK99bHOjuiTajR1xON7Kq4maM09IlClqIH4RCbaYWryQLu2FuHpP_zeMjPwWWtyo7UGXz0lzoDvfL_pK8DACy_EtQM8DqjF5zSG1DkiUSqcPb3Hk8Dzpq5oggwMmBYothvViHTCBNYkGlkM3WxV5LairS9NcWrmmL6IBPQA2YYFzR4vp3HjQxeedV-ps5sIdB" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined p-3 bg-secondary-container text-on-secondary-container rounded-2xl">account_balance</span>
              <span className="text-[10px] font-bold py-1 px-2 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">Hôm nay</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Doanh thu VNPay (Ngày)</p>
            <p className="text-2xl font-extrabold text-on-surface mt-1">18.450.000 đ</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Hệ thống đang hoạt động ổn định</span>
            </div>
          </div>
        </div>
      </section>

      {/* Log Table Section */}
      <section className="bg-surface-container-lowest rounded-[2rem] overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container">
          <h3 className="text-lg font-bold text-on-surface">Nhật ký giao dịch chi tiết</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full border border-outline-variant text-xs font-bold hover:bg-surface-container transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Bộ lọc
            </button>
            <button className="px-4 py-2 rounded-full bg-surface-container text-primary text-xs font-bold hover:brightness-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>
              Xuất Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-4">VNP Reference</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Ngân hàng</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-8 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-5 font-mono text-xs text-primary font-bold">VNP14298530</td>
                <td className="px-6 py-5 font-semibold text-on-surface">#BATCH-8821</td>
                <td className="px-6 py-5 font-extrabold text-on-surface">5.400.000 đ</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">VCB</div>
                    <span className="text-xs font-medium">Vietcombank</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500 text-xs">14:22:15, 24/05/2024</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    00 - THÀNH CÔNG
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                    VIEW RAW JSON
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-5 font-mono text-xs text-primary font-bold">VNP14298529</td>
                <td className="px-6 py-5 font-semibold text-on-surface">#BATCH-8820</td>
                <td className="px-6 py-5 font-extrabold text-on-surface">12.200.000 đ</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">VTB</div>
                    <span className="text-xs font-medium">VietinBank</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500 text-xs">13:58:42, 24/05/2024</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    00 - THÀNH CÔNG
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                    VIEW RAW JSON
                  </button>
                </td>
              </tr>
              {/* Row 3 (Fail State Example) */}
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-5 font-mono text-xs text-slate-400 font-bold">VNP14298528</td>
                <td className="px-6 py-5 font-semibold text-on-surface">#BATCH-8819</td>
                <td className="px-6 py-5 font-extrabold text-on-surface">2.150.000 đ</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">TPB</div>
                    <span className="text-xs font-medium">TPBank</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500 text-xs">13:10:05, 24/05/2024</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-error text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    24 - KHÁCH HÀNG HỦY
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                    VIEW RAW JSON
                  </button>
                </td>
              </tr>
              {/* Row 4 */}
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-5 font-mono text-xs text-primary font-bold">VNP14298527</td>
                <td className="px-6 py-5 font-semibold text-on-surface">#BATCH-8818</td>
                <td className="px-6 py-5 font-extrabold text-on-surface">850.000 đ</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">BIDV</div>
                    <span className="text-xs font-medium">BIDV</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500 text-xs">12:45:30, 24/05/2024</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    00 - THÀNH CÔNG
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                    VIEW RAW JSON
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 bg-surface-container-low/30 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Hiển thị 1-10 trên 1,429 kết quả</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-400">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded-lg bg-white text-on-surface flex items-center justify-center shadow-sm text-xs font-bold">2</button>
            <button className="w-8 h-8 rounded-lg bg-white text-on-surface flex items-center justify-center shadow-sm text-xs font-bold">3</button>
            <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-400">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="px-8 py-6 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest border-t border-surface-container">
        <span>© 2024 DeepStream Pro - VNPay Integration Service</span>
        <div className="flex gap-4">
          <a className="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a>
          <a className="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a>
        </div>
      </footer>
    </div>
  );
}
