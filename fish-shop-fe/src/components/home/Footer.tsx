import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-16 px-4 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 text-on-primary-container">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="font-headline text-xl font-extrabold">Hydro-Precision</h2>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Trại cá giống kỹ thuật cao hàng đầu Việt Nam. Chúng tôi không chỉ bán cá, chúng tôi bán giải pháp nuôi cá thành công.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6">Sản phẩm</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href="#" className="hover:text-white transition-colors">Cá Koi Nhật F1</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Cá Rồng nhập khẩu</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Hệ thống lọc Bio-Filter</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Thức ăn tăng trưởng cao cấp</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Liên kết</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href="#" className="hover:text-white transition-colors">Vận chuyển &amp; Bảo hành</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Chính sách kiểm dịch</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Tra cứu đơn hàng</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Blog kỹ thuật</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Đăng ký bản tin</h4>
          <p className="text-sm text-white/60 mb-4">Nhận cập nhật về các dòng giống mới nhất và mẹo chăm sóc.</p>
          <div className="flex">
            <input className="bg-white/10 outline-none border-none rounded-l-lg text-sm w-full py-2 px-3 focus:ring-1 focus:ring-white/30" placeholder="Email của bạn" type="email" />
            <button className="bg-tertiary px-4 rounded-r-lg hover:bg-tertiary/80 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-white/40 text-xs">
        © 2024 Hydro-Precision Hatchery. Thiết kế theo tiêu chuẩn curator kỹ thuật cao.
      </div>
    </footer>
  );
}
