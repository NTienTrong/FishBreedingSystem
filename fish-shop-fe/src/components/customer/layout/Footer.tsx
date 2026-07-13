import Link from "next/link";
import ShopLocationMap from "@/components/common/ShopLocationMap";

const Footer = () => {
  return (
    <footer className="w-full border-t mt-20 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-12 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-xl font-bold text-[#005B71] dark:text-[#00A3C4] font-headline">
            FishSync
          </div>
          <p className="font-['Inter'] text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Hệ thống quản lý và cung cấp cá cảnh, sản phẩm và nội dung kỹ thuật cho khách hàng Việt Nam.
          </p>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-[#00A3C4] hover:bg-primary hover:text-white dark:hover:bg-[#00A3C4] dark:hover:text-slate-900 transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">public</span>
            </a>
            <a
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-[#00A3C4] hover:bg-primary hover:text-white dark:hover:bg-[#00A3C4] dark:hover:text-slate-900 transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-primary dark:text-[#00A3C4] font-headline">Điều hướng</h4>
          <ul className="space-y-3 font-['Inter'] text-sm">
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/products"
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/#danh-muc"
              >
                Danh mục
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/blog"
              >
                Blog kỹ thuật
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/cart"
              >
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-primary dark:text-[#00A3C4] font-headline">Tài khoản</h4>
          <ul className="space-y-3 font-['Inter'] text-sm">
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/profile"
              >
                Hồ sơ cá nhân
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/profile"
              >
                Địa chỉ giao hàng
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/profile"
              >
                Đơn hàng của tôi
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-600 dark:text-slate-400 hover:text-[#005B71] dark:hover:text-[#00A3C4] hover:translate-x-1 transition-transform duration-200 block"
                href="/checkout"
              >
                Thanh toán
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-primary dark:text-[#00A3C4] font-headline">Liên hệ</h4>
          <p className="font-['Inter'] text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Thị trấn Lim, Huyện Tiên Du, Tỉnh Bắc Ninh
            <br />
            Hotline: 1900 8888
            <br />
            Email: contact@fishsync.vn
          </p>
          <ShopLocationMap />
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center font-['Inter'] text-sm text-slate-500">
        © 2026 FishSync. Hệ thống cá cảnh và nội dung kỹ thuật.
      </div>
    </footer>
  );
};

export default Footer;
