export default function AdminDashboardPage() {
  return (
    <>
      <div className="p-8 space-y-8">
        {/* Hero Stats: Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface-container-low p-6 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng doanh thu</p>
              <h2 className="text-2xl font-headline font-extrabold text-primary mt-1">124.5M VND</h2>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm font-bold relative z-10">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +12.5% <span className="text-slate-400 font-normal ml-1">so với tháng trước</span>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/5 rotate-12">monetization_on</span>
          </div>

          <div className="bg-surface-container-low p-6 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng đơn hàng</p>
              <h2 className="text-2xl font-headline font-extrabold text-primary mt-1">1,284</h2>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm font-bold relative z-10">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +8.2% <span className="text-slate-400 font-normal ml-1">so với tháng trước</span>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/5 rotate-12">shopping_bag</span>
          </div>

          <div className="bg-surface-container-low p-6 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng khách hàng</p>
              <h2 className="text-2xl font-headline font-extrabold text-primary mt-1">420</h2>
            </div>
            <p className="text-slate-400 text-sm relative z-10">Người dùng đang hoạt động</p>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/5 rotate-12">group</span>
          </div>

          <div className="bg-surface-container-highest p-6 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tồn kho thấp</p>
              <h2 className="text-2xl font-headline font-extrabold text-error mt-1">08</h2>
            </div>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline relative z-10">
              Xem chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-error/5 rotate-12">warning</span>
          </div>
        </div>

        {/* Charts Section: Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Chart Mockup */}
          <div className="lg:col-span-2 bg-surface-container-low rounded-[2rem] p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-lg font-headline font-bold text-primary">Tăng trưởng doanh thu</h3>
                <p className="text-sm text-slate-500">Thống kê 7 ngày vừa qua</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-primary shadow-sm">TUẦN NÀY</span>
                <span className="px-3 py-1 bg-slate-200 rounded-full text-[10px] font-bold text-slate-400">TUẦN TRƯỚC</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4 relative">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 border-b border-outline-variant/15 pointer-events-none">
                <div className="w-full border-t border-outline-variant/15"></div>
                <div className="w-full border-t border-outline-variant/15"></div>
                <div className="w-full border-t border-outline-variant/15"></div>
              </div>
              {/* Chart Bars/Points simulation with SVG */}
              <div className="flex-1 h-full flex items-end justify-around z-10 px-4">
                <div className="w-2 bg-secondary/20 rounded-t-full h-[40%] transition-all hover:bg-secondary"></div>
                <div className="w-2 bg-secondary/20 rounded-t-full h-[60%] transition-all hover:bg-secondary"></div>
                <div className="w-2 bg-secondary/20 rounded-t-full h-[55%] transition-all hover:bg-secondary"></div>
                <div className="w-2 bg-secondary h-[85%] rounded-t-full transition-all hover:scale-x-150"></div>
                <div className="w-2 bg-secondary/20 rounded-t-full h-[45%] transition-all hover:bg-secondary"></div>
                <div className="w-2 bg-secondary/20 rounded-t-full h-[70%] transition-all hover:bg-secondary"></div>
                <div className="w-2 bg-secondary/20 rounded-t-full h-[30%] transition-all hover:bg-secondary"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-4 px-6">
              <span>THỨ 2</span><span>THỨ 3</span><span>THỨ 4</span><span>THỨ 5</span><span>THỨ 6</span><span>THỨ 7</span><span>CN</span>
            </div>
          </div>

          {/* Pie Chart Mockup */}
          <div className="bg-primary text-white rounded-[2rem] p-8 flex flex-col">
            <h3 className="text-lg font-headline font-bold mb-2">Cơ cấu sản phẩm</h3>
            <p className="text-sm text-primary-container mb-8">Phân loại theo danh mục</p>
            <div className="relative flex-1 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-[12px] border-primary-container relative flex items-center justify-center">
                <div className="absolute inset-0 border-[12px] border-secondary-fixed rounded-full" style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)" }}></div>
                <div className="absolute inset-0 border-[12px] border-tertiary-fixed-dim rounded-full" style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)" }}></div>
                <div className="text-center">
                  <span className="text-3xl font-extrabold leading-none">84%</span>
                  <p className="text-[10px] text-primary-container font-bold uppercase tracking-tighter">Hiệu suất</p>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                  <span className="text-xs font-medium">Cá Koi</span>
                </div>
                <span className="text-xs font-bold">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                  <span className="text-xs font-medium">Cá Rồng</span>
                </div>
                <span className="text-xs font-bold">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  <span className="text-xs font-medium">Thức ăn &amp; Phụ kiện</span>
                </div>
                <span className="text-xs font-bold">30%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-surface-container-low rounded-[2rem] overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
            <h3 className="text-lg font-headline font-bold text-primary">Top 5 sản phẩm bán chạy nhất tháng</h3>
            <button className="text-xs font-bold text-primary px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">Xuất báo cáo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-outline-variant/10">
                  <th className="px-8 py-4">Sản phẩm</th>
                  <th className="px-8 py-4">Danh mục</th>
                  <th className="px-8 py-4">Số lượng</th>
                  <th className="px-8 py-4">Doanh thu</th>
                  <th className="px-8 py-4">Xu hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                <tr className="group hover:bg-white transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200">
                        <img alt="Kohaku Koi Fish" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyKvjGR0Otcw31ptagoo57IJsDGNADihZQZ-2bluAlSpXVRWPqgoCbM9fD9t1SWa9mgu6FJBuKlPelQEtu8QYwuu2mOTGGuMxTxIrKIQir5O_VgERQIcUGw8Tg7C7AUrxjOLlCbQL14D_Px1xsM0YaMeK2zBagnADNApP38MvqMeZvfsIGsd6G5QgMjPqCmW9UVkl2Hjl0TpsKOQdmOe5D3oj8S2Ue4EjYm-b_pnQvNzV-myq8GhpaT7txYgPoLVnCyVN3DlL4MHGO"/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">Kohaku Premium Grade A</p>
                        <p className="text-[10px] text-slate-500">SKU: KOI-KH-001</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold">CÁ KOI</span>
                  </td>
                  <td className="px-8 py-4 font-medium">42 con</td>
                  <td className="px-8 py-4 font-bold text-primary">28.4M VND</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      <span className="text-xs font-bold">+15%</span>
                    </div>
                  </td>
                </tr>
                <tr className="group hover:bg-white transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200">
                        <img alt="Golden Dragon Fish" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgNrt4GeZdWzlFWzkVaKV8o7n6T939GjmKBsWQKktWwXe1AdjI_PLHRUY0Te5xWz6-AcvzKQSvrCcjKSkzIiY-W1XTQWysJOJySaMFm4k_PD5s4RYguQgnwmhVJOV31Y3HorTJl1CG9KnheXNpg5hoTjP1Ij7i9J1TTQiBaJqgslkvaJNTVLYFZ3a_xlCuwdzT2P3ah7ZP5F0Zm5eNArpqPlfKtgSWWWlk9H04TVKiB20IiV4maZng_eH756ZROynyo5x4hxlTwHcD"/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">Kim Long Quá Bối 24K</p>
                        <p className="text-[10px] text-slate-500">SKU: DRN-GL-045</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-[10px] font-bold">CÁ RỒNG</span>
                  </td>
                  <td className="px-8 py-4 font-medium">12 con</td>
                  <td className="px-8 py-4 font-bold text-primary">45.0M VND</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      <span className="text-xs font-bold">+8%</span>
                    </div>
                  </td>
                </tr>
                <tr className="group hover:bg-white transition-colors border-none">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200">
                        <img alt="Aquarium Filtration System" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY3ft_2pMka9i2vwTFtNxiEOLXXIxXsQc5z9XucWYbSfJ3pLS_XzPBA9xnL22LDyq9A9Sbvjyi86YFcsW8pskZJpSF_vvYiJu0ODdB5O54eIPC78h6lzyH3lYUiH0S_jAZN4p6-7BI-9f8ebluJSBRdir-u5IAP-Hh3_RjPb7Xy8CuEGjC6g7txv4JszqjYKyXg11ETRBwxVMCfmvzOKMCrb3-Dz0Rb2CgckOTtF7t-QhkGzVFhGzsWngwv0XFVlmvaL04CEaamVdT"/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">Lọc Drum Filter 20m3/h</p>
                        <p className="text-[10px] text-slate-500">SKU: ACC-DF-880</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold">PHỤ KIỆN</span>
                  </td>
                  <td className="px-8 py-4 font-medium">05 bộ</td>
                  <td className="px-8 py-4 font-bold text-primary">15.5M VND</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="material-symbols-outlined text-sm">horizontal_rule</span>
                      <span className="text-xs font-bold">0%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contextual FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group">
          <span className="material-symbols-outlined text-3xl">add</span>
          <span className="absolute right-full mr-4 bg-white text-primary px-4 py-2 rounded-lg font-bold text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Tạo đơn hàng mới
          </span>
        </button>
      </div>
    </>
  );
}
