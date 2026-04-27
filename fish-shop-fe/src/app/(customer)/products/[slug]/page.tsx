import Link from "next/link";

export default function ProductDetailsPage({ params }: { params: { slug: string } }) {
  return (
    <main className="px-6 max-w-7xl mx-auto pb-12">
      {/* Product Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative rounded-xl overflow-hidden bg-surface-container-low aspect-[4/3] group">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVX0F94vQbxg1x0PCeIuEsdxJe1fGGn8UtcGc0gDJNdhuWOsseVWnpwjzuQ-6xwCffeXI1rV5AQya__lDTWMy_COBYyrCWKWL5eq-EqlY9MBInmouufnMoxZaqskuasrp3r2CF2AD99rh0JbCPpUTp3qBckOKd5FjWOIUoj91cK6W8BP92d0wuDYW3IKMAz-9u8K0pI1qgDbfPXllch2dngo82uODNvTbn6r8pwlgSGODwBrv6nN9OjVXMg0nHpIxDKKO0MtCPU8v0"
              alt="Discus fish main"
            />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl p-2 rounded-full border border-white/30 cursor-pointer hover:bg-white/40 transition-colors">
              <span className="material-symbols-outlined text-white">favorite</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg overflow-hidden cursor-pointer border-2 border-primary-container bg-surface-container-low aspect-square">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFClr-PX65iNfCwhMe76YXK152trx6qNbz_1aORbwtI_jDcjWH3UspmYy_hOmfba0gyKite95fAJkIgo6dmerv9iGtRIFoamZ7XVLbLk8T0WfiN7Wm78F5dRjbTU1gnlmlfW-AmRPyqQtwrH1aWQP30dEpTQT58oYhSYAW3MgrTU6agbA7rQxDWRLXZHXeGD-41BhKWQtL9nS67Q-U_8W_PpZLi1WnDmcWU0lTvAF72fXylc67dOcQLlZNgl_ex1SKxE59pMx1JudM"
                alt="Gallery 1"
              />
            </div>
            <div className="rounded-lg overflow-hidden cursor-pointer opacity-60 hover:opacity-100 transition-opacity bg-surface-container-low aspect-square">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8lx1SJ7T9dE-3etd1SJCd0YsjDdjSpPvpUkxjd-lxmrcsDrUnrWX1hcmvN3qoZMr6m2Oof2d3tFLg6y6KbFRsu36c2HVxvt1UUGhkkw-icCoiw_o272DsbmltzRiWv3D88ey-qspWf40-AKWDMcP0Xhsc5o3Pv1NYW1nu6f_26UZaHJ4W4IIhASXcX2nX0zK38Fwmmdlq4-jF-E7shU25M5yQSRdwKlRgJJcy4-1TUoT-I3gY0GudaJe8k3l9aGQTzxgSFXVYZhXu"
                alt="Gallery 2"
              />
            </div>
            <div className="rounded-lg overflow-hidden cursor-pointer opacity-60 hover:opacity-100 transition-opacity bg-surface-container-low aspect-square">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAesvgPj3oTdLphsDARi9LecdH-IVcuHTTRK4PUEvmxOH-V1hSBVSjOpDBHMfKsJjb6Pa6MOWN4AYl-uQQvVGxPARDKEouhfZOCPjMdvgmAqhKJl5v9dROcitAVTEGqzKH8eP2LnvScEjOnVYfDKPwhRtBto_aWX989NI4W4Jn5qNMKOC5HeuftIB2iRyibilhvGqt3MMd5uAanezidH3o5tbTs7shPTXUsHf6FjSUsIzVGNROkjEAcoLD3mSoHKgakljyUC7pVAb8f"
                alt="Gallery 3"
              />
            </div>
            <div className="rounded-lg overflow-hidden cursor-pointer opacity-60 hover:opacity-100 transition-opacity bg-surface-container-low aspect-square">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcOAAzJSXdUwxU24mxZ9pL-HJFPF1mw6X5LD-2T4b2Q_RyIy1qgnfvcnX2rXvUZn6qJnxvY1MBLy2wAtQyoG71bCVGEqfGD-ZD8x64tn9bbuPsjUAmv1pUoGs1UIt7cuyQ5zU9rtb4qY0Nj6hE1uKGIYDGWF70HNHfPUqHBLXSl296mrC748E8rXBWOMkdHWJDj6nJwkwiaFOlPUor4HLQRxsppkuXbZYr6oIagI0RU5Ap47jdNn3ar6M0TPuaFoyowo39LPIq_iHD"
                alt="Gallery 4"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="mb-2">
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest uppercase">
              Premium Grade
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">
            Discus Symphysodon Blue Diamond
          </h1>
          <p className="text-on-surface-variant font-label text-sm mb-6">SKU: FS-AQU-DIS-0042</p>
          
          <div className="mb-8">
            <span className="text-3xl font-black text-tertiary-container tracking-tighter">4.250.000₫</span>
            <span className="ml-4 text-outline line-through text-lg">4.900.000₫</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-primary">verified</span>
              <div>
                <p className="text-xs font-bold text-on-surface uppercase tracking-tight">Trạng thái Hatchery</p>
                <p className="text-sm text-on-surface-variant">Sẵn sàng vận chuyển toàn cầu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-primary">health_and_safety</span>
              <div>
                <p className="text-xs font-bold text-on-surface uppercase tracking-tight">Bảo hành sinh tồn</p>
                <p className="text-sm text-on-surface-variant">Chứng nhận y tế 100% khi nhận hàng</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all scale-100 active:scale-95">
              Mua ngay
            </button>
            <button className="w-full py-4 px-6 bg-surface-container-highest text-primary border border-outline-variant/15 rounded-full font-bold text-lg hover:bg-surface-container-high transition-all">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Technical Tabs Section */}
      <section className="mt-24">
        <div className="flex items-center gap-8 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <button className="text-primary font-bold text-xl whitespace-nowrap border-b-4 border-primary pb-2">Thông số kỹ thuật</button>
          <button className="text-outline font-bold text-xl whitespace-nowrap hover:text-primary transition-colors pb-2">Hồ sơ sức khỏe</button>
          <button className="text-outline font-bold text-xl whitespace-nowrap hover:text-primary transition-colors pb-2">Mô tả</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Attribute Table (Asymmetric Bento Style) */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs text-outline font-bold uppercase tracking-widest block mb-2">Độ pH tối ưu</span>
                <span className="text-2xl font-black text-primary">6.0 - 7.5</span>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs text-outline font-bold uppercase tracking-widest block mb-2">Nhiệt độ (°C)</span>
                <span className="text-2xl font-black text-primary">28° - 31°</span>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs text-outline font-bold uppercase tracking-widest block mb-2">Kích thước tối đa</span>
                <span className="text-2xl font-black text-primary">15 - 20 cm</span>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs text-outline font-bold uppercase tracking-widest block mb-2">Độ cứng nước</span>
                <span className="text-2xl font-black text-primary">Soft - Medium</span>
              </div>
            </div>
          </div>

          {/* Health Profile / Data */}
          <div className="bg-primary text-white p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">biotech</span>
                Hệ thống FishSync Bio-Track
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span>Vaccine đa năng A1</span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed text-xs px-2 py-1 rounded">Đã tiêm</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span>Kiểm dịch thủy sinh</span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed text-xs px-2 py-1 rounded">Hoàn tất</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span>Chứng chỉ DNA gốc</span>
                  <span className="text-on-primary-container font-mono text-sm">#DNA-DIS-0012</span>
                </div>
              </div>
              <p className="mt-8 text-sm opacity-80 leading-relaxed font-body">
                Mọi cá thể tại FishSync đều được theo dõi qua hệ thống Spring Boot thời gian thực, đảm bảo lịch sử y tế minh bạch từ lúc ấp nở đến khi giao hàng.
              </p>
            </div>
            {/* Abstract Background Texture */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-32">
        <h2 className="text-3xl font-extrabold text-primary mb-12">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Related Card 1 */}
          <Link href="/products/neon-tetra" className="group cursor-pointer">
            <div className="bg-surface-container-low rounded-xl overflow-hidden aspect-square mb-4 transition-all duration-300 group-hover:shadow-xl group-hover:bg-surface-container-highest">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJYYPPTLUVShSF6kQTNHmRZdL3RgwzL0B3xIASknpD7f_JDL5T6JKgWuGmeve9uJHMmAY4wNG2SqHOcn2JBPwlCOi-6CkkpomEXvNB1knZvHAQLXqDcTOqeE_9u3JhC8Ymw_Wq99xtrmWzixZEmquM4spSYIW9jmwkn6rnvrqFIZ3phpgeiL-CmbOgeibkdYpEVwroJ7nePnMFLtZSJbrhzGQvKtyqvKNG7E3r0olpI0tc5v0zue_mkLYVPs_h7fdLZBxDO0Gy756f"
                alt="Neon Tetra"
              />
            </div>
            <h4 className="font-bold text-on-surface mb-1">Neon Tetra XL</h4>
            <p className="text-tertiary-container font-black">450.000₫</p>
          </Link>
          {/* Related Card 2 */}
          <Link href="/products/altum-angelfish" className="group cursor-pointer">
            <div className="bg-surface-container-low rounded-xl overflow-hidden aspect-square mb-4 transition-all duration-300 group-hover:shadow-xl group-hover:bg-surface-container-highest">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8HGVd9gp4PZBKQxOrDsxLGfrnEfdTzk-E_UAOyK3bDGPd1i5yLiAuHy7shjwxD5GbbJzwEFwO8LRFhdhGZ73Wan0sWmgJ0zdkKGmaqv5YuzwyR5Ir0_VGPJNP7x4sS9o6P0BFk5Vzim5ea-aWepkyFwqRv7lso29ceukQuNxzljKQn2CqpSXvcodD9u8HLuFwqfkvMVR3BPuj1Ec6dcoZiE_ZNayeGDRiJyi4tqYq14-jL2BFrJTsk0b7267MdTM1cEgH0dWT0x0"
                alt="Angelfish"
              />
            </div>
            <h4 className="font-bold text-on-surface mb-1">Altum Angelfish</h4>
            <p className="text-tertiary-container font-black">1.200.000₫</p>
          </Link>
          {/* Related Card 3 */}
          <Link href="/products/crystal-red-shrimp" className="group cursor-pointer">
            <div className="bg-surface-container-low rounded-xl overflow-hidden aspect-square mb-4 transition-all duration-300 group-hover:shadow-xl group-hover:bg-surface-container-highest">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyx0xL8uRCucRPlEl5N-59JmKIo0jBFq_gtn_87bnx2Zs5eAxSGfuUjOgxPGdLR9LT3Kkk9mcKS48BbPYDsYMJ2dUepwBn0DlUu7iy4SvRe3lBW8ow1To-WYKETW4CAuMvXVyJ2hzyMm8ci4hQsyGCvFvJQItuIqKTNVLJGfykOG7oR4Y05jMsGjJJREhOCKTVRbHOgM6f5swgYUGw5SywMgisWvtzy545ejSk0YvUupT3mkINKrNf3y9IJWnHkJpEEmtDwDDT1mhU"
                alt="Shrimp"
              />
            </div>
            <h4 className="font-bold text-on-surface mb-1">Crystal Red Shrimp</h4>
            <p className="text-tertiary-container font-black">85.000₫</p>
          </Link>
          {/* Related Card 4 */}
          <Link href="/products/zebra-pleco" className="group cursor-pointer">
            <div className="bg-surface-container-low rounded-xl overflow-hidden aspect-square mb-4 transition-all duration-300 group-hover:shadow-xl group-hover:bg-surface-container-highest">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcVyC78IUpqFSdaHsZQjzP4KJA-qn-83XfCIm3KQJqqEBmdi65OATH2IAZ3KVcR5tE06pCyzUFqaMrbFAHZVu1Q3sSZgIiXiSr6IFIZWxSokp-ujQ7BtH7MSeTFTBVpdk1gH29XWvZft8NEGbnoGIbeUkBMGQHj25N4Q3RrAROuSYXK-vV2Uz4PjRAcioSAHvziZ2xRLGr3Kf9HhiuIiHAG0MYO0HvHWld7zgpkDKRMItx51mgKPYMODM_spA8YdWZv6ARouLC2swp"
                alt="Zebra Pleco"
              />
            </div>
            <h4 className="font-bold text-on-surface mb-1">Zebra Pleco L46</h4>
            <p className="text-tertiary-container font-black">8.500.000₫</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
