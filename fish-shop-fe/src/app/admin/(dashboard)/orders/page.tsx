export default function AdminOrdersPage() {
  return (
    <div className="p-8 max-w-7xl w-full mx-auto">
      {/* Page Header Asymmetry Layout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="relative">
          <span className="absolute -top-6 -left-2 text-6xl font-black text-primary opacity-[0.03] select-none">ORDERS</span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight -mb-1">Danh sách Đơn hàng</h1>
          <p className="text-on-surface-variant font-medium">Quản lý các giao dịch phôi giống và thiết bị thủy sản.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high rounded-full font-semibold text-primary transition-all hover:bg-primary hover:text-white group">
            <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform">download</span>
            Xuất báo cáo
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
            Tạo đơn mới
          </button>
        </div>
      </div>

      {/* Bento Filter Tray */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 p-5 bg-surface-container-low rounded-xl flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Bộ lọc trạng thái</label>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold">Tất cả</button>
            <button className="px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-semibold hover:bg-secondary-container transition-colors">Chờ xác nhận</button>
            <button className="px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-semibold hover:bg-secondary-container transition-colors">Đang giao</button>
            <button className="px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-semibold hover:bg-secondary-container transition-colors">Hoàn thành</button>
          </div>
        </div>
        <div className="p-5 bg-surface-container-low rounded-xl flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Khoảng thời gian</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-primary text-lg">calendar_today</span>
            <select className="pl-7 w-full bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none">
              <option>Tháng này</option>
              <option>7 ngày qua</option>
              <option>Quý này</option>
              <option>Tùy chọn...</option>
            </select>
          </div>
        </div>
        <div className="p-5 bg-surface-container-low rounded-xl flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Phương thức</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-primary text-lg">account_balance_wallet</span>
            <select className="pl-7 w-full bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none">
              <option>VNPay</option>
              <option>Chuyển khoản</option>
              <option>Tiền mặt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Precision Data Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/15">
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Mã đơn</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Thanh toán</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Trạng thái đơn</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Ngày đặt</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {/* Row 1 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors group">
              <td className="px-6 py-4 font-mono text-sm text-primary font-bold">#ORD-9921</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-xs font-bold">NH</div>
                  <div>
                    <p className="text-sm font-bold">Nguyễn Văn Hùng</p>
                    <p className="text-[11px] text-on-surface-variant">Hợp tác xã Thủy sản Miền Tây</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold">45.500.000 ₫</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium text-on-surface-variant">VNPay - Thành công</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="relative group/dropdown">
                  <button className="flex items-center justify-between w-36 px-3 py-1.5 rounded-lg bg-primary-container/10 text-primary text-xs font-bold hover:bg-primary-container/20 transition-all">
                    Đang đóng gói
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">14/05/2024</td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-highest rounded-full text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors group">
              <td className="px-6 py-4 font-mono text-sm text-primary font-bold">#ORD-9920</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed text-xs font-bold">TL</div>
                  <div>
                    <p className="text-sm font-bold">Trần Thị Lan</p>
                    <p className="text-[11px] text-on-surface-variant">Cá Giống ABC</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold">12.200.000 ₫</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-medium text-on-surface-variant">VNPay - Chờ thanh toán</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <button className="flex items-center justify-between w-36 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold">
                  Chờ xác nhận
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </td>
              <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">13/05/2024</td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-highest rounded-full text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors group">
              <td className="px-6 py-4 font-mono text-sm text-primary font-bold">#ORD-9919</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full object-cover" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzKuvrcspxcjyOjrYqxXQ0PdVU9RSS3MjbRmiKJB1GhJR5YFDDmEyfbxNceC7q1ve9_2rAug1gSZFkar7NifoGdc0EdUKC5EOdzAdUKZHvF4E7pSv-ZCRdbcUanIfVupPwVzfKkhGRd90RgQ3J7087IOoFLSG14_k_Alo0cFOI2Hheb57dzTO-xDWt28WyKfpdmTCf2cy6m5oiY4zhSYGT3m1uY0XYyajYj7wTjO5AP3rCQPiqS4Lsb6L85c9Mx2LjgfR4rS3ZDI_T" />
                  <div>
                    <p className="text-sm font-bold">Phạm Minh Đức</p>
                    <p className="text-[11px] text-on-surface-variant">Cá cảnh Hải Phòng</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold">5.800.000 ₫</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium text-on-surface-variant">VNPay - Thành công</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <button className="flex items-center justify-between w-36 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-bold">
                  Đang giao
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </td>
              <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">12/05/2024</td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-highest rounded-full text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
            {/* Row 4 */}
            <tr className="hover:bg-surface-container-low/50 transition-colors group">
              <td className="px-6 py-4 font-mono text-sm text-primary font-bold">#ORD-9918</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary text-xs font-bold">QV</div>
                  <div>
                    <p className="text-sm font-bold">Quách Văn Tuyên</p>
                    <p className="text-[11px] text-on-surface-variant">Farm Tôm Sóc Trăng</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold">120.450.000 ₫</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium text-on-surface-variant">VNPay - Thành công</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <button className="flex items-center justify-between w-36 px-3 py-1.5 rounded-lg bg-tertiary-container/10 text-tertiary text-xs font-bold">
                  Hoàn thành
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </td>
              <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">10/05/2024</td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-highest rounded-full text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination Shell */}
        <div className="px-6 py-5 flex items-center justify-between bg-surface-container-low border-t border-outline-variant/10">
          <p className="text-xs font-medium text-on-surface-variant">Đang xem 1 - 4 của 128 đơn hàng</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-bold transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-bold transition-colors">3</button>
            <span className="text-on-surface-variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-bold transition-colors">32</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Insight (Bento Element) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-primary-container text-white rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Doanh thu tháng này</p>
            <p className="text-3xl font-extrabold mb-4 tracking-tighter">1.248.000.000 ₫</p>
            <div className="flex items-center gap-2 text-xs font-bold text-secondary-container bg-white/10 w-fit px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +12.5% so với tháng trước
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 select-none">payments</span>
        </div>
        <div className="md:col-span-2 p-6 bg-surface-container rounded-2xl flex items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-extrabold text-primary mb-1">Hiệu suất vận chuyển</h3>
            <p className="text-sm text-on-surface-variant mb-4">98% đơn hàng được đóng gói trong vòng 24h.</p>
            <div className="w-full bg-white rounded-full h-3 relative">
              <div className="bg-secondary h-full rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
          <div className="hidden lg:block w-32 h-20 rounded-xl overflow-hidden shadow-inner">
            <img className="w-full h-full object-cover opacity-80" alt="Water" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzuienwOSi_8i_k6rD4xdXP6ZiJxqrc6HcxNqn8d5J6VWiQiLPAbiohTSNrCs8tWQ0NebnP83YEIu-IfPp7Q4Dd9Zj_YPV1hpmTPfw1XH4nxOiPgkD-X50KiTn-Yya1A7aEmMredo0t4D3NnW4B40oSZeG00KycFnSTYRr-w-cqlAXhgKuO3jKA-fGRS8TuN48FgDZG12owDqj4dfJlHdg8m4dLdItAN_3T9DuUSJ7vS3fRW7Crnc0f8z84t7WIcCRiYyHwSrwH798" />
          </div>
        </div>
      </div>
    </div>
  );
}
