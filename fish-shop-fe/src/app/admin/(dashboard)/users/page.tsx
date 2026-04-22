export default function AdminUsersPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Quản lý Người dùng</h2>
          <p className="text-on-surface-variant max-w-lg">Giám sát và phân quyền truy cập hệ thống cho toàn bộ nhân sự và khách hàng trong mạng lưới DeepStream.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-full bg-surface-container-high text-on-surface font-semibold flex items-center gap-2 hover:bg-surface-container-highest transition-all">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span>Lọc Vai trò</span>
          </button>
          <button className="px-6 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined">person_add</span>
            <span>Thêm Thành viên</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Grid (Custom Visual for Authority) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
          <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container">group</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Tổng Người dùng</p>
            <h3 className="text-2xl font-extrabold text-primary">1,284</h3>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
          <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">shield_person</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Quản trị viên</p>
            <h3 className="text-2xl font-extrabold text-primary">12</h3>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
          <div className="w-12 h-12 bg-tertiary-fixed rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary">engineering</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Nhân viên Hệ thống</p>
            <h3 className="text-2xl font-extrabold text-primary">48</h3>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-4 border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiệu suất Hệ thống</p>
          <p className="text-lg font-bold text-secondary">Tối ưu (98%)</p>
        </div>
      </div>

      {/* User Data Table Container */}
      <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Người dùng</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Liên hệ</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Vai trò</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Ngày gia nhập</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {/* User Row 1 */}
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary font-bold">NV</div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Nguyễn Văn A</p>
                      <p className="text-xs text-slate-400">ID: #USR-0921</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-on-surface">vana.nguyen@deepstream.com</p>
                    <p className="text-xs text-slate-400">090 123 4567</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select className="bg-surface-container-high border-none rounded-lg text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 py-1.5 pl-3 pr-8 appearance-none cursor-pointer outline-none">
                    <option defaultValue="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="text-xs font-bold text-secondary">Đang hoạt động</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">12/03/2023</td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all" title="Reset Mật khẩu">
                      <span className="material-symbols-outlined text-lg">lock_reset</span>
                    </button>
                    <button className="w-12 h-6 bg-secondary-fixed-dim rounded-full p-1 relative flex items-center transition-all group-hover:scale-105">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                    </button>
                  </div>
                </td>
              </tr>
              {/* User Row 2 */}
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <img className="w-10 h-10 rounded-full object-cover" alt="User 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBj7MtCn_Vrw1Paq18Zxr0Q3E0yrT1Tgg8B8EpvdF9m_SfD9Tq8lxe81h2Yb9S1C6xrlgutdm5NJVDOGCBuhYGOxb9GXC7mJLyk69Vu5GVB5S2hH5I8dr5hueY6Ob_bE4K3XPGE2WncDjoiIj2rgPFspDkG5zqBccy-i7Emd_zhBsvIxTRE8p8m64-DYRCqYTIozIWPdmIfhRm_wDdgYCfPfPxhpx-kvPPJeKC3fW14PPNMAEPAJIMJZdGqXRHO-x24TSq0F6l5Mgv" />
                    <div>
                      <p className="text-sm font-bold text-on-surface">Lê Thị B</p>
                      <p className="text-xs text-slate-400">ID: #USR-0882</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-on-surface">lethib@gmail.com</p>
                    <p className="text-xs text-slate-400">091 999 8888</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select defaultValue="staff" className="bg-surface-container-high border-none rounded-lg text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 py-1.5 pl-3 pr-8 appearance-none cursor-pointer outline-none">
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="text-xs font-bold text-secondary">Đang hoạt động</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">05/01/2024</td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-lg">lock_reset</span>
                    </button>
                    <button className="w-12 h-6 bg-secondary-fixed-dim rounded-full p-1 relative flex items-center transition-all group-hover:scale-105">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                    </button>
                  </div>
                </td>
              </tr>
              {/* User Row 3 (Locked State) */}
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4 opacity-60">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">TM</div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Trần Minh C</p>
                      <p className="text-xs text-slate-400">ID: #USR-0741</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 opacity-60">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-on-surface">minhc.tran@outlook.com</p>
                    <p className="text-xs text-slate-400">098 765 4321</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select defaultValue="customer" className="bg-surface-container-high border-none rounded-lg text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 py-1.5 pl-3 pr-8 appearance-none cursor-pointer outline-none">
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    <span className="text-xs font-bold text-error">Đã khóa</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">18/11/2023</td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-lg">lock_reset</span>
                    </button>
                    <button className="w-12 h-6 bg-slate-300 rounded-full p-1 relative flex items-center transition-all group-hover:scale-105">
                      <div className="w-4 h-4 bg-white rounded-full translate-x-0"></div>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-8 py-6 bg-surface-container-low/30 border-t border-surface-container flex justify-between items-center">
          <p className="text-xs font-medium text-on-surface-variant">Hiển thị <span className="text-primary font-bold">1-10</span> trong số <span className="text-primary font-bold">1,284</span> người dùng</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-sm">first_page</span>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs">1</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs hover:bg-surface-container-high transition-all">2</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs hover:bg-surface-container-high transition-all">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-xs">...</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-sm">last_page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
