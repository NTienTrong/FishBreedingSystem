import Link from "next/link";

export default function ProductsPage() {
  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      {/* Hero Section Asymmetry */}
      <section className="mb-16 relative">
        <div className="flex flex-col md:flex-row items-end gap-8">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold mb-4 tracking-widest uppercase">
              Precision Breeding
            </span>
            <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-primary leading-none mb-4">
              Hệ Thống Phân Phối <br /> Thủy Sinh Chính Xác
            </h1>
            <p className="text-on-surface-variant max-w-lg font-body leading-relaxed">
              Cung cấp các dòng cá Koi thuần chủng từ các trại danh tiếng Nhật Bản, được theo dõi sức khỏe thông qua hệ thống FishSync Labs.
            </p>
          </div>
          <div className="flex-shrink-0 bg-surface-container-low p-4 rounded-xl hidden lg:block">
            <div className="flex gap-4 items-center">
              <div className="text-right">
                <p className="text-sm font-bold text-primary">Live Lab Feed</p>
                <p className="text-xs text-on-surface-variant">Ph: 7.2 | Temp: 24°C</p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined">analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Sidebar Filter */}
        <aside className="w-full md:w-64 space-y-10">
          {/* Category Accordion */}
          <div className="group">
            <h3 className="font-headline font-extrabold text-primary flex items-center justify-between cursor-pointer mb-6 group-hover:text-secondary-container transition-colors">
              DANH MỤC
              <span className="material-symbols-outlined">expand_more</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-surface-container-highest rounded-xl text-primary font-bold flex justify-between items-center transition-all">
                Cá Koi
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </div>
              <div className="pl-4 space-y-2 border-l-2 border-outline-variant/30 ml-2">
                <a className="block py-1 text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                  Kohaku
                </a>
                <a className="block py-1 text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                  Taisho Sanke
                </a>
                <a className="block py-1 text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                  Showa Sanshoku
                </a>
                <a className="block py-1 text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
                  Utsurimono
                </a>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div>
            <h3 className="font-headline font-extrabold text-primary mb-6">THÔNG SỐ</h3>
            <div className="space-y-6">
              {/* Size */}
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-3">
                  Kích thước (cm)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-surface-container text-xs font-bold rounded-lg border border-transparent hover:border-primary transition-all">
                    15-30cm
                  </button>
                  <button className="px-3 py-2 bg-surface-container text-xs font-bold rounded-lg border border-transparent hover:border-primary transition-all">
                    30-45cm
                  </button>
                  <button className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg transition-all">
                    45-60cm
                  </button>
                  <button className="px-3 py-2 bg-surface-container text-xs font-bold rounded-lg border border-transparent hover:border-primary transition-all">
                    60cm+
                  </button>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-3">
                  Giới tính
                </label>
                <div className="flex gap-2">
                  <span className="flex-1 px-3 py-2 bg-surface-container-low text-center rounded-lg text-xs font-medium cursor-pointer hover:bg-surface-container transition-all">
                    Đực
                  </span>
                  <span className="flex-1 px-3 py-2 bg-surface-container-low text-center rounded-lg text-xs font-medium cursor-pointer hover:bg-surface-container transition-all">
                    Cái
                  </span>
                  <span className="flex-1 px-3 py-2 bg-secondary text-white text-center rounded-lg text-xs font-medium cursor-pointer transition-all">
                    Chưa xác định
                  </span>
                </div>
              </div>

              {/* Origin */}
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-3">
                  Nguồn gốc
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded bg-surface-container-highest flex items-center justify-center group-hover:ring-2 ring-primary/20 transition-all">
                      <div className="w-2 h-2 bg-primary rounded-sm opacity-100"></div>
                    </div>
                    <span className="text-sm text-on-surface-variant">Nhập khẩu Nhật Bản</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded bg-surface-container-highest flex items-center justify-center group-hover:ring-2 ring-primary/20 transition-all"></div>
                    <span className="text-sm text-on-surface-variant">F1 (Việt Nam)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <h3 className="font-headline font-extrabold text-primary mb-6">KHOẢNG GIÁ (VNĐ)</h3>
            <div className="relative pt-4 px-2">
              <div className="h-1.5 bg-surface-container-highest rounded-full w-full">
                <div className="absolute h-1.5 bg-primary rounded-full left-1/4 right-1/4"></div>
              </div>
              <div className="absolute top-3 left-1/4 -ml-2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md cursor-pointer"></div>
              <div className="absolute top-3 right-1/4 -mr-2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md cursor-pointer"></div>
            </div>
            <div className="flex justify-between mt-6">
              <div className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-bold text-primary tracking-tight">
                5,000,000
              </div>
              <div className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-bold text-primary tracking-tight">
                50,000,000
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1">
          {/* Sorting & Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div className="text-on-surface-variant text-sm font-medium">
              Hiển thị <span className="text-primary font-bold">48</span> kết quả cho Cá Koi
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-outline uppercase tracking-widest">Sắp xếp:</span>
              <div className="relative">
                <select className="appearance-none bg-surface-container-low border-none rounded-xl py-2 pl-4 pr-10 text-sm font-bold text-primary focus:ring-2 ring-primary-container/50 cursor-pointer">
                  <option>Mới nhất</option>
                  <option>Giá: Thấp đến Cao</option>
                  <option>Giá: Cao đến Thấp</option>
                  <option>Theo sort_order</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/50">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product Card 1 */}
            <Link href="/products/1" className="group">
              <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(25,28,30,0.06)] group-hover:translate-y-[-4px]">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3T4jprXJ1k-ZEUbpahGMxoH3cFZCmdrGzru25xPTcnpqIoSeY4QETxzdCbaOBA8w_tNzU4xVfUwZm8YofEJ4MeHHjQYL43brGttIQeTEbUmh62YqtfnJelotuf4C9csMQGDXgzBXLHylwVfa_h09iZvL3ynjqwz8k1OTZdkd1cFaHb7ea_21-NJdp1n5F_nfs80LSbIWwVCKomIphFqV12horuou48frgPwoOVGxufkImpH1JRp28kB_HzplPhgZp4jRZmQX-0Hoz"
                  alt="Koi"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded backdrop-blur-md">
                    Premium
                  </span>
                </div>
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div className="mt-5 space-y-1 px-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline font-extrabold text-primary group-hover:text-secondary transition-colors">
                    Kohaku Japanese Grade A
                  </h4>
                  <span className="text-[10px] text-outline font-bold bg-surface-container-high px-2 py-0.5 rounded uppercase">
                    JAPAN
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">Size: 55cm • Giới tính: Cái</p>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-lg font-black text-primary tracking-tighter">18.500.000đ</span>
                </div>
              </div>
            </Link>

            {/* Product Card 2 */}
            <Link href="/products/2" className="group">
              <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(25,28,30,0.06)] group-hover:translate-y-[-4px]">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCi-baXJ9lR1ASzamruCIj24gWvLptsqDoOLfLBqKR2W6ynF-SxQHpng77DR1jUJRJCl9OIaEUx6qGGepl9Jab0Nru4uylsUOQgF5cdkXXPNtfcbO9IHo4SpPl2xnpsyGHQvSP1eOTEbVO6r7Uwom3jAA2ZOYfYa910kkXG4BZueRVBKA0lgb5m9Q6KVTd2g-_by9Nqhymb1i9SBZaLtmcxw31eTwiEPi9Ph5w8aFHAoyQzM8vPl_3fR0Roa01EmSoAcyb1QD-HBAwe"
                  alt="Koi"
                />
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div className="mt-5 space-y-1 px-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline font-extrabold text-primary group-hover:text-secondary transition-colors">
                    Taisho Sanke Dainichi
                  </h4>
                  <span className="text-[10px] text-outline font-bold bg-surface-container-high px-2 py-0.5 rounded uppercase">
                    JAPAN
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">Size: 42cm • Giới tính: Đực</p>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-lg font-black text-primary tracking-tighter">12.200.000đ</span>
                </div>
              </div>
            </Link>

            {/* Product Card 3 */}
            <Link href="/products/3" className="group">
              <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(25,28,30,0.06)] group-hover:translate-y-[-4px]">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRHX2fI4z7HHrD82CGWrn3Q03tw4mvWPbSEkpglaJakKKOBOWQ_uky1l5dPnnwtZOyMCCFDxN-k8fMj7s7GMeazwJirL-sgdb6JTez4tszgmlbqJDXT9WImId9zPQcyZKiDGSTOqQtODkv7mnIukv8Ovggg4n8-P9jFo-R7exkMKniEEAogGrl0fm0IRKf0oIzW118IzueEeE-rx4IYk_mGtd82gWLbohFumz0R_x7EbS0_U6h7kX9QzMLchvnYRdd2BRpJurei353"
                  alt="Koi"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                    New Arrival
                  </span>
                </div>
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div className="mt-5 space-y-1 px-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline font-extrabold text-primary group-hover:text-secondary transition-colors">
                    Showa Sanshoku Isa Koi
                  </h4>
                  <span className="text-[10px] text-outline font-bold bg-surface-container-high px-2 py-0.5 rounded uppercase">
                    JAPAN
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">Size: 60cm • Giới tính: Cái</p>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-lg font-black text-primary tracking-tighter">45.000.000đ</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Pagination */}
          <div className="mt-20 flex justify-center">
            <button className="group flex flex-col items-center gap-4">
              <div className="px-10 py-4 bg-primary text-white font-headline font-bold rounded-full tracking-wider hover:bg-primary-container transition-all flex items-center gap-2">
                Xem thêm
                <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">
                  expand_more
                </span>
              </div>
              <span className="text-[10px] font-bold text-outline tracking-widest uppercase">
                Hiển thị 3 trong số 48 cá Koi
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
