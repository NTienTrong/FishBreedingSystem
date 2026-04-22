"use client";

import React from "react";

interface UserFormProps {
  isEdit?: boolean;
}

export default function UserForm({ isEdit = false }: UserFormProps) {
  return (
    <div className="p-8">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        {/* Header Actions */}
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {isEdit ? "Cập nhật tài khoản" : "Thêm thành viên mới"}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Quản lý thông tin cá nhân và quyền truy cập của người dùng.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors" type="button">
              Hủy
            </button>
            <button className="px-8 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all" type="submit">
              {isEdit ? "Lưu thay đổi" : "Lưu người dùng"}
            </button>
          </div>
        </div>

        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Họ và tên</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none" placeholder="Ví dụ: Nguyễn Văn A" defaultValue={isEdit ? "Lê Thị B" : ""} type="text" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Địa chỉ Email</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" placeholder="email@domain.com" defaultValue={isEdit ? "lethib@gmail.com" : ""} type="email" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Số điện thoại</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" placeholder="09xx xxx xxx" defaultValue={isEdit ? "091 999 8888" : ""} type="tel" />
              </div>

              {!isEdit && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Mật khẩu khởi tạo</label>
                  <div className="relative">
                    <input className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nhập mật khẩu hoặc để hệ thống tự tạo" type="password" />
                    <button type="button" className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ cái và số.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Side Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Avatar Section */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm text-center">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Ảnh đại diện</label>
            <div className="w-32 h-32 mx-auto rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative group">
              {isEdit ? (
                <>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBj7MtCn_Vrw1Paq18Zxr0Q3E0yrT1Tgg8B8EpvdF9m_SfD9Tq8lxe81h2Yb9S1C6xrlgutdm5NJVDOGCBuhYGOxb9GXC7mJLyk69Vu5GVB5S2hH5I8dr5hueY6Ob_bE4K3XPGE2WncDjoiIj2rgPFspDkG5zqBccy-i7Emd_zhBsvIxTRE8p8m64-DYRCqYTIozIWPdmIfhRm_wDdgYCfPfPxhpx-kvPPJeKC3fW14PPNMAEPAJIMJZdGqXRHO-x24TSq0F6l5Mgv" alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">account_circle</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary mt-1">TẢI LÊN</span>
                </>
              )}
            </div>
          </section>

          {/* Account Settings */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Trạng thái (Active)</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Vai trò (Role)</label>
              <select className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={isEdit ? "staff" : "customer"}>
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="staff">Nhân viên (Staff)</option>
                <option value="customer">Khách hàng (Customer)</option>
              </select>
            </div>

            {isEdit && (
              <div className="pt-4 border-t border-outline-variant/30">
                <button type="button" className="w-full py-2.5 rounded-lg border border-error text-error text-xs font-bold hover:bg-error/10 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                  Khôi phục mật khẩu
                </button>
              </div>
            )}
          </section>
        </div>
      </form>
    </div>
  );
}
