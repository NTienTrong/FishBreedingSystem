import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t-0 mt-20 bg-surface-container-lowest dark:bg-slate-950 px-12 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-xl font-bold text-[#005B71] font-headline">
            FishSync
          </div>
          <p className="font-['Inter'] text-sm leading-relaxed text-slate-500">
            Precision Aquatic Husbandry. Hệ thống quản lý và cung cấp cá cảnh
            tiêu chuẩn cao nhất Việt Nam.
          </p>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">public</span>
            </a>
            <a
              className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-primary font-headline">Danh mục</h4>
          <ul className="space-y-3 font-['Inter'] text-sm">
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Cá Koi Nhật
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Cá Rồng Cao Cấp
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Thiết Bị Lọc
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Thức Ăn Dinh Dưỡng
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-primary font-headline">Chính sách</h4>
          <ul className="space-y-3 font-['Inter'] text-sm">
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Hatchery Standards
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Technical Support
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-orange-500 hover:translate-x-1 transition-transform duration-200 block"
                href="#"
              >
                Global Shipping
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-primary font-headline">Liên hệ</h4>
          <p className="font-['Inter'] text-sm text-slate-500 leading-relaxed">
            123 Đường Thủy Sinh, Quận 7, TP. Hồ Chí Minh
            <br />
            Hotline: 1900 8888
            <br />
            Email: contact@fishsync.vn
          </p>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-outline-variant/10 text-center font-['Inter'] text-sm text-slate-400">
        © 2024 FishSync. Precision Aquatic Husbandry.
      </div>
    </footer>
  );
};

export default Footer;
