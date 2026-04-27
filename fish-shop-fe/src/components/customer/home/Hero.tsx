import Image from "next/image";

const Hero = () => {
  return (
    <section className="px-6 py-12 lg:py-24 max-w-7xl mx-auto overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-12 items-center bg-surface-container-low rounded-[2rem] p-8 lg:p-16 relative">
        <div className="z-10">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            Premium Hatchery Selection
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold font-headline leading-tight tracking-tighter text-primary mb-8">
            Con giống chuẩn - <br />
            <span className="text-secondary">Sức khỏe chứng nhận</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-md mb-10 leading-relaxed font-medium">
            Hệ thống cung cấp cá cảnh sinh học chính xác. Tối ưu hóa gene và kiểm soát môi trường nuôi dưỡng đạt tiêu chuẩn Labs quốc tế.
          </p>
          <button className="bg-[#FD7E14] hover:bg-[#E8590C] text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-1 flex items-center gap-3">
            Mua ngay
            <span className="material-symbols-outlined">trending_flat</span>
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/10 blur-[120px] rounded-full"></div>
          <img
            alt="High-res koi"
            className="relative z-10 w-full h-auto object-cover rounded-3xl transform rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf5jt3cJDR9HJxQvimuXg7zm0wjXqJy-98tw004rq5BS9OYd2_rKRazBbFQvwWcFcaCkDTYfh0BP39RpUUM_GGMtH1R-Ar5Th02lupcoqzDB9Uo8kRvS27-_pYLQQZueCqq6EjFI3IPpB8WF5wy0xYF2CAq8W1ZPShCsnx9wcFavx_Wt6KRGJQy3tGLmTC08Myt1Hep--j0TXOY4B0m5d8re5v6qhBVKopD7p5t5hHqdAKpd4PDQtB9ZC-U0QPLW7szF008WyhCVJg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
