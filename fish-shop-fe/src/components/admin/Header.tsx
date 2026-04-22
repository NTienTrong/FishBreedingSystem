"use client";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  
  const getBreadcrumb = () => {
    if (pathname.includes("/products")) return "Sản phẩm";
    if (pathname.includes("/orders")) return "Đơn hàng";
    if (pathname.includes("/transactions")) return "Thanh toán";
    if (pathname.includes("/users")) return "Người dùng";
    if (pathname.includes("/blog")) return "Bài viết";
    if (pathname.includes("/attributes")) return "Danh mục & Thuộc tính";
    return "Thống kê";
  };

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl font-['Inter'] text-sm font-medium border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="hover:text-primary transition-colors cursor-pointer">Cửa hàng</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold border-b-2 border-primary pb-1">{getBreadcrumb()}</span>
        </div>

        <div className="ml-10 relative focus-within:ring-2 focus-within:ring-[#005B71]/20 rounded-full transition-all group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            className="pl-12 pr-6 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full w-80 text-sm focus:ring-0 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-primary transition-all relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-500 hover:text-primary transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface leading-none">Admin User</p>
            <p className="text-[10px] text-slate-500 font-medium">Quản trị viên</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-primary transition-all overflow-hidden relative">
             <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGcHMUAygD4Lv18z6iSeJ6rOHm2w4SU0YXMQkNh8rqyZb7QZbnZBMNnFM3XiU5JBay89lmC8nrklnwlTp0c4_nx4YTrv4KVBEwv9In9Dn6i73RTRJ2eFwuCuYheAsBMvyZGwVzNppt4if9w0lJZD1Y4DD_fF7_ODNbwxHCSVqxH9h2EM0mNgHavaXLbCW_C-A8Da-6rCf_i-uZvgj9BsQq8QkZyxyCw4ptz8ygDleiA2ENke1Pkh-vlOsfXhQP02W0FnoqpOE2RqiL"
              alt="Admin User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
