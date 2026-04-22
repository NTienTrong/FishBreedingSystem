import React from "react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[500px] lg:min-h-[640px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 hero-gradient z-10"></div>
        <img alt="Hồ cá Koi" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvYxTcyBXLWjkfwxct2UxBEYfmZeHPjXH_-yuaDA6B7palTk2-ozDKFiAFoauK-z1-X8jMPvjq7N9xqhWUmpCpUDWbQDR-jFkan-4XZk0EGsZY8D5CSu_7zOJTuT1p455RAEUlGvb55i38xCYYhk9EleU4IZmxCuLKllxzl-9kgchDISAdSohxyvvCmCk-tHaaNcsAXRrz0gqRyeJGVECVnLl7Q-7p4QLW575P1ndUeSWu3p9d34JD_ux3pBcN2z2Tso7SGVIRiVGc"/>
      </div>
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-10 lg:px-20 text-center lg:text-left w-full mt-10">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase rounded-full mb-6">Hydro-Precision Standards</span>
          <h2 className="font-headline text-4xl md:text-6xl font-black leading-tight text-white mb-6 drop-shadow-md">
            Trại Cá Giống Hydro-Precision – Nguồn Giống Thuần Chủng, Bảo Hành Sống 100%
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 font-medium max-w-2xl">
            Chuyên cung cấp các dòng cá cảnh cao cấp với quy trình kiểm soát thông số nước nghiêm ngặt và công nghệ sinh học tiên tiến.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="cta-gradient text-white px-8 py-4 rounded-full font-headline text-lg font-extrabold shadow-xl hover:scale-105 transition-transform">
              Xem sản phẩm ngay
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-headline text-lg font-bold hover:bg-white/20 transition-all">
              Tư vấn kỹ thuật
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
