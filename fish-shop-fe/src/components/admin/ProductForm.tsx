"use client";

import React from "react";

interface ProductFormProps {
  isEdit?: boolean;
}

export default function ProductForm({ isEdit = false }: ProductFormProps) {
  return (
    <div className="p-8">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        {/* Header Actions */}
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Thiết lập thông tin sinh học và kỹ thuật cho cá giống.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors" type="button">
              Hủy
            </button>
            <button className="px-8 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all" type="submit">
              {isEdit ? "Lưu thay đổi" : "Lưu sản phẩm"}
            </button>
          </div>
        </div>

        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* General Info Card */}
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Tên sản phẩm</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none" placeholder="Ví dụ: Cá Koi Nhật Bản - Tancho Kohaku" defaultValue={isEdit ? "Cá Koi Nhật Bản - Tancho Kohaku" : ""} type="text" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Mã SKU</label>
                <div className="relative">
                  <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 pl-10 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" placeholder="SKU-2024-001" defaultValue={isEdit ? "SKU-2024-001" : ""} type="text" />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-sm">barcode</span>
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Đường dẫn (Slug)</label>
                <input className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-500 italic cursor-not-allowed outline-none" disabled placeholder="ca-koi-nhat-ban-tancho" defaultValue={isEdit ? "ca-koi-nhat-ban-tancho" : ""} type="text" />
              </div>
            </div>
          </section>

          {/* Rich Text Editor Section */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Mô tả kỹ thuật nuôi</label>
            <div className="border border-outline-variant/30 rounded-lg overflow-hidden">
              <div className="bg-surface-container-low p-2 flex gap-1 border-b border-outline-variant/30">
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">link</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">image</span></button>
              </div>
              <textarea className="w-full border-none p-4 focus:ring-0 text-on-surface leading-relaxed resize-none outline-none" placeholder="Nhập hướng dẫn chi tiết về môi trường sống, chế độ dinh dưỡng..." defaultValue={isEdit ? "Đây là mô tả chi tiết của sản phẩm..." : ""} rows={8}></textarea>
            </div>
          </section>

          {/* Multi-image Upload Area */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Hình ảnh sản phẩm</label>
            <div className="grid grid-cols-4 gap-4">
              {/* Upload Trigger */}
              <div className="aspect-square border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary transition-all cursor-pointer group">
                <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary">TẢI LÊN</span>
              </div>
              {/* Preview Items */}
              <div className="aspect-square rounded-xl bg-surface-container-high relative overflow-hidden group">
                <img className="w-full h-full object-cover" alt="Image 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_EJTtt47_L7WH5BFCHFFjjKDaqVKdk-0ey1xJM2hsAIImGDpBTOsjp_Zo1lcO_pksc2H-8xGDdfdyxBFHweifEnsOUblmjhLH-UM960HOYnaUKLWOwC3OGhcYtRuhAUp-Bt25IH_ZY98STZ-qzes3S-hLPl5zso552zx5M_l9jFE0qznT3iLfKY4rHSFzCqIjap7qCGRh_rq_pCzVK8mu1zcPNcxg2R6-KHbRscUemv4krOAnTxxaOEa0QIKuBYt3I8xn7fcef6G4" />
                <button className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" type="button"><span className="material-symbols-outlined text-xs">close</span></button>
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 py-1 text-center text-[8px] text-white font-bold">ẢNH CHÍNH</div>
              </div>
              <div className="aspect-square rounded-xl bg-surface-container-high relative overflow-hidden group">
                <img className="w-full h-full object-cover" alt="Image 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKjY4-YZgBjQXv6MQW64YGr_SVIRCIwop4mp6p8JkS5zGX7xuY82_For3pktW-DqGTF129b09aVNOAfIinnO3ywps2z4LksZsTEehaY1Ne9dGjkwpqNYehJJTwmbDENPmTv_wcLCayswxsCO525dO3vsw80BNXwUlBYiFx6SJ381KnxN2040P6uooGFek3PYU_66wy2-wSHa-4_xKielIf1STrj64GRqB2w_rMC5gEE3QKAK8PdglMT4OqYxkwKT2huYWYSPcJmJo3" />
                <button className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" type="button"><span className="material-symbols-outlined text-xs">close</span></button>
              </div>
              <div className="aspect-square rounded-xl bg-surface-container-high relative overflow-hidden group">
                <img className="w-full h-full object-cover" alt="Image 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZbRjDCrzOGiVsNMK6jgtJa_ZQW1ggpjUv0sFtL5TIK9irTjLF-a4hdC5bsuxsLdrDdzgvphuB4c4MpYXltW1ZRybK4EzVHjIdkLf-wTq7P4UTjsgkXyCtu65wUTl8x2vSZsYVJ8-c2xrR9U6pH3Me7m4Ap4PKreRREd38-V6zMqubiZ1WQ5php1-UEMAmQIi3bjkVi8ap_DZooQoilCldbtJ7eMoE3r2iRhQt1lAo9qlrIfitK5fMaodcZQozlyKvV_G1WenbeAu7" />
                <button className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" type="button"><span className="material-symbols-outlined text-xs">close</span></button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">Kích thước khuyên dùng: 1200x1200px. Định dạng: JPG, PNG. Tối đa 10 ảnh.</p>
          </section>
        </div>

        {/* Side Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Inventory Card */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Trạng thái</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Giá bán (VNĐ)</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0.00" defaultValue={isEdit ? 1500000 : undefined} type="number" />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Số lượng tồn kho</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="100" defaultValue={isEdit ? 100 : undefined} type="number" />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Danh mục</label>
                <select className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={isEdit ? "Cá Koi Nhật" : undefined}>
                  <option>Cá Koi Nhật</option>
                  <option>Cá Cảnh Nhiệt Đới</option>
                  <option>Thức Ăn &amp; Dinh Dưỡng</option>
                  <option>Hệ Thống Lọc</option>
                </select>
              </div>
            </div>
          </section>

          {/* Biological Attributes Card */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-secondary">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">science</span>
              Chỉ số sinh học
            </h3>
            <div className="space-y-5">
              {/* pH Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Độ pH lý tưởng</label>
                  <span className="text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">6.5 - 7.5</span>
                </div>
                <div className="relative h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="absolute h-full bg-secondary left-1/4 w-1/2"></div>
                </div>
              </div>

              {/* Temp Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Nhiệt độ (°C)</label>
                <div className="flex gap-2">
                  <input className="w-full text-center bg-surface-container-highest border-none rounded-lg py-2 text-sm focus:ring-1 focus:ring-secondary outline-none" defaultValue={isEdit ? "18" : ""} placeholder="Min" type="text" />
                  <input className="w-full text-center bg-surface-container-highest border-none rounded-lg py-2 text-sm focus:ring-1 focus:ring-secondary outline-none" defaultValue={isEdit ? "32" : ""} placeholder="Max" type="text" />
                </div>
              </div>

              {/* Level Select */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Độ khó chăm sóc</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className={`py-2 rounded-lg text-[10px] font-bold shadow-sm transition-colors ${!isEdit ? "bg-secondary text-white" : "bg-surface-container-high text-slate-400 hover:bg-secondary/10"}`} type="button">DỄ</button>
                  <button className={`py-2 rounded-lg text-[10px] font-bold shadow-sm transition-colors ${isEdit ? "bg-secondary text-white" : "bg-surface-container-high text-slate-400 hover:bg-secondary/10"}`} type="button">TRUNG BÌNH</button>
                  <button className="py-2 rounded-lg bg-surface-container-high text-[10px] font-bold text-slate-400 hover:bg-secondary/10 transition-colors" type="button">KHÓ</button>
                </div>
              </div>

              {/* Size Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Kích thước trưởng thành</label>
                <div className="relative">
                  <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={isEdit ? "35 - 50" : ""} placeholder="Ví dụ: 35 - 50" type="text" />
                  <span className="absolute right-4 top-3 text-[10px] font-bold text-slate-400">CM</span>
                </div>
              </div>
            </div>
          </section>

          {/* Advanced Settings Section */}
          <section className="bg-surface-container-low/50 p-6 rounded-xl border border-dashed border-outline-variant/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Thông tin bổ sung</h4>
            <div className="flex items-center gap-3 mb-3">
              <input className="rounded border-outline-variant text-primary focus:ring-primary" id="feature" defaultChecked={isEdit} type="checkbox" />
              <label className="text-xs text-on-surface-variant font-medium" htmlFor="feature">Sản phẩm nổi bật (Trang chủ)</label>
            </div>
            <div className="flex items-center gap-3">
              <input className="rounded border-outline-variant text-primary focus:ring-primary" id="preorder" type="checkbox" />
              <label className="text-xs text-on-surface-variant font-medium" htmlFor="preorder">Cho phép đặt hàng trước</label>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
