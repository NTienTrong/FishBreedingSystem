import React from "react";

export default function WhyChooseUs() {
  return (
    <section className="bg-surface-container-low py-20 px-4 md:px-10 lg:px-20 border-y border-outline-variant/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl font-black text-primary">Sự Khác Biệt Từ Hydro-Precision</h2>
          <div className="w-20 h-1 bg-tertiary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center group">
            <div className="size-20 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
              <span className="material-symbols-outlined text-4xl">rocket_launch</span>
            </div>
            <h3 className="font-headline text-xl font-extrabold text-on-surface mb-3">Vận chuyển Chuyên dụng</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Sử dụng thùng xốp cách nhiệt oxy nén cao áp, đảm bảo cá khỏe mạnh trong 48h di chuyển.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="size-20 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <h3 className="font-headline text-xl font-extrabold text-on-surface mb-3">Kiểm dịch Nghiêm ngặt</h3>
            <p className="text-on-surface-variant leading-relaxed">
              100% cá giống được kiểm dịch, đảm bảo không mang mầm bệnh virus KHV hay ký sinh trùng gây hại.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="size-20 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
              <span className="material-symbols-outlined text-4xl">support_agent</span>
            </div>
            <h3 className="font-headline text-xl font-extrabold text-on-surface mb-3">Hỗ trợ Kỹ thuật Trọn đời</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Đội ngũ chuyên gia sẵn sàng tư vấn xử lý nước và trị bệnh cho cá miễn phí trọn vòng đời sản phẩm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
