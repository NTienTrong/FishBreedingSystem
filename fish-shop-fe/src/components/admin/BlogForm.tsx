"use client";

import React from "react";

interface BlogFormProps {
  isEdit?: boolean;
}

export default function BlogForm({ isEdit = false }: BlogFormProps) {
  return (
    <div className="p-8 min-h-[calc(100vh-72px)]">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        {/* Header Actions */}
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {isEdit ? "Cập nhật bài viết" : "Viết bài mới"}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Soạn thảo và quản lý nội dung xuất bản trên hệ thống.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors" type="button">
              Lưu nháp
            </button>
            <button className="px-8 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all" type="submit">
              {isEdit ? "Cập nhật nội dung" : "Xuất bản bài viết"}
            </button>
          </div>
        </div>

        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* General Info Card */}
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Tiêu đề bài viết</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-[18px] font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none" placeholder="Nhập tiêu đề ấn tượng..." defaultValue={isEdit ? "Tối ưu hóa nồng độ Oxy hòa tan trong bể ương dưỡng" : ""} type="text" />
              </div>
              
              <div className="col-span-2 relative">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Đường dẫn (Slug)</label>
                <input className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-500 italic pr-24 outline-none" placeholder="duong-dan-bai-viet" defaultValue={isEdit ? "toi-uu-hoa-nong-do-oxy-hoa-tan-trong-be-uong-duong" : ""} type="text" />
                <button type="button" className="absolute right-2 top-8 text-xs font-bold text-secondary bg-secondary-container px-3 py-1 rounded">Cập nhật</button>
              </div>
            </div>
          </section>

          {/* Rich Text Editor Section */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Nội dung bài viết</label>
            <div className="border border-outline-variant/30 rounded-lg overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-surface-container-low p-2 flex gap-1 border-b border-outline-variant/30 flex-wrap">
                <div className="flex bg-white rounded shadow-sm mr-2 border border-outline-variant/20 overflow-hidden">
                  <select className="border-none text-sm focus:ring-0 px-3 py-1">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                    <option>Heading 3</option>
                  </select>
                </div>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_underlined</span></button>
                <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_list_numbered</span></button>
                <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">link</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">image</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">code</span></button>
              </div>
              <textarea className="w-full flex-1 border-none p-6 focus:ring-0 text-on-surface leading-loose resize-y outline-none" placeholder="Bắt đầu viết nội dung tại đây..." defaultValue={isEdit ? "Trong bài viết này, chúng tôi sẽ hướng dẫn chi tiết các bước để đảm bảo lượng oxy hòa tan đạt chuẩn...\n\nThành phần hệ thống sục khí...\n" : ""}></textarea>
            </div>
          </section>
        </div>

        {/* Side Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Post Settings */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Trạng thái</label>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${isEdit ? "bg-secondary/10 text-secondary" : "bg-outline/10 text-outline"}`}>
                  {isEdit ? "Published" : "Draft"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked={isEdit} className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">folder</span> Danh mục
                </label>
                <select className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={isEdit ? "technical" : ""}>
                  <option value="" disabled>-- Chọn danh mục --</option>
                  <option value="technical">Kỹ thuật nuôi</option>
                  <option value="disease">Dịch bệnh</option>
                  <option value="market">Thị trường</option>
                  <option value="operation">Vận hành</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span> Ngày xuất bản
                </label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none" type="datetime-local" defaultValue={isEdit ? "2023-10-12T08:30" : ""} />
                <p className="text-[10px] text-slate-400 mt-1">Để trống nếu muốn xuất bản ngay khi lưu.</p>
              </div>
            </div>
          </section>

          {/* Thumbnail Section */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm text-center">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Ảnh bìa (Thumbnail)</label>
            <div className="aspect-[16/9] w-full rounded-xl bg-surface-container-high border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative group">
              {isEdit ? (
                <>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1_qnizlqc1xTjZCx9m-wLSDi-hTsddlMdXf8enXHSuW5e7Odfz3iGYb-bLm3KUSnlO7NhX9oV_6fXHOkIZT_eBrv6-52vS7gf-Oe_L2IIJ94k9ZM3p1GxKJ_1lIKK0JLQqjI0YPIGoD_NWQKiVXnuULYARedMOHd90ULTuYbIqbpBXpYcTKrJJ7hnwaJ4L9BScTSmKjlbmGp-fk6Ltuw7iiaFuhk6WPfvXaOTAI5-iGeAVNmWacgsrIvK3PYNuTC_aZmTsvaRk3J0" alt="News Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-3xl mb-1">imagesmode</span>
                    <span className="text-xs text-white font-bold">Thay Đổi</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary mt-2">TẢI LÊN ẢNH BÌA</span>
                  <p className="text-[9px] text-slate-400 mt-2">Tỉ lệ 16:9, Tối đa 2MB</p>
                </>
              )}
            </div>
          </section>

          {/* SEO Preview Section */}
          <section className="bg-surface-container-low/50 p-6 rounded-xl border border-dashed border-outline-variant/50 relative overflow-hidden">
            <h4 className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase mb-3">
              <span className="material-symbols-outlined text-[14px]">search</span>
              Bản xem trước SEO
            </h4>
            <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
              <p className="text-[#1a0dab] text-sm font-medium truncate">DeepStream Pro - {isEdit ? "Tối ưu hóa nồng độ Oxy hòa tan trong bể ương dưỡng" : "Tiêu đề bài viết..."}</p>
              <p className="text-[11px] text-[#006621] truncate">https://deepstream.com/blog/{isEdit ? "toi-uu-hoa-nong-do..." : "duong-dan"}</p>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                {isEdit ? "Trong bài viết này, chúng tôi sẽ hướng dẫn chi tiết các bước để đảm bảo lượng oxy hòa tan đạt chuẩn trong các bể ương dưỡng lớn, tránh tình trạng cá ngạt..." : "Mô tả ngắn hiển thị trên công cụ tìm kiếm phụ thuộc vào đoạn đầu của nội dung bài viết."}
              </p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
