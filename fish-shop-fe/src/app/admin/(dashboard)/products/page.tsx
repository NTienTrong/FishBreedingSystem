export default function AdminProductsPage() {
  return (
    <>
      <div className="px-8 py-8">
        {/* Page Header Actions */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight mb-1">Danh sách Sản phẩm</h2>
            <p className="text-slate-500">Quản lý và cập nhật kho sản phẩm cá giống DeepStream Pro.</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            Thêm sản phẩm mới
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface-container-low rounded-3xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-outline-variant/10">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Danh mục:</span>
              <select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer text-primary outline-none">
                <option>Tất cả loài</option>
                <option>Cá Koi Nhật</option>
                <option>Cá Tầm</option>
                <option>Cá Hồi Vân</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-outline-variant/10">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Trạng thái:</span>
              <select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer text-primary outline-none">
                <option>Tất cả trạng thái</option>
                <option>Đang kinh doanh</option>
                <option>Hết hàng</option>
                <option>Ngừng bán</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-primary transition-colors font-medium">
              <span className="material-symbols-outlined text-lg">filter_alt</span>
              Bộ lọc nâng cao
            </button>
          </div>
          <p className="text-sm font-medium text-slate-400">Hiển thị 10 trong 1,284 sản phẩm</p>
        </div>

        {/* Data Table Container */}
        <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-5 w-12">
                  <input className="rounded text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
                </th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest font-headline">Sản phẩm</th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest font-headline">SKU</th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest font-headline">Giá bán</th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest font-headline">Kho hàng</th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest font-headline">Trạng thái</th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest font-headline text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-5">
                  <input className="rounded text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <img className="w-14 h-14 rounded-2xl object-cover shadow-md border border-white" alt="Koi Fish" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6qQB4UI-B7ot4p2L1Erm0cRzmlQIkNn9zsVVeBHtZFYUxQFBvHRikJqbQUdAqG2AHOYPIqOE4qLgwtADvlBwd4UcsKl1q8rGWx3hiWoIRoOqPTXrlHQO2nU-lrjGQUbasGUOej1h8iNxaOnAmsk_zB7yjkx-Cm9XWXoLFVGD92hYe2jiqfsogrt3Owp0f3tI9jbwaWn0NAnAhzo1gHq9LDxQOmur74wReIr610Fd0jVFLedh0ARKdeY1rSx1WXj_hUO3zNl4P7yyC" />
                    <div>
                      <p className="font-bold text-on-surface group-hover:text-primary transition-colors">Koi Kohaku Nhật Bản</p>
                      <p className="text-xs text-slate-400">Loài: Cyprinus rubrofuscus</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 font-mono text-sm text-slate-500">KOI-KH-001</td>
                <td className="p-5 font-bold text-secondary">2,450,000 ₫</td>
                <td className="p-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-on-surface">42 con</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-secondary rounded-full"></div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-primary-container/10 text-primary rounded-lg transition-all" title="Sửa">
                      <span className="material-symbols-outlined text-xl">edit_square</span>
                    </button>
                    <button className="p-2 hover:bg-error/10 text-error rounded-lg transition-all" title="Xóa">
                      <span className="material-symbols-outlined text-xl">delete_sweep</span>
                    </button>
                  </div>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="p-5">
                  <input className="rounded text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <img className="w-14 h-14 rounded-2xl object-cover shadow-md border border-white" alt="Fish" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhDkSs9qkUcm4XFZkGerW-BX9En0mvoyBwikwQDknKzvIM44s4F8Uh9kMp92gZDtym3Is6sVOqMz-icC3AIoXF1L6k2gaAOM2ihSgxGeTzWTLvoI3xH-QbBaIRrebHQ8gbS4dIpmhwah0tl5di4l80zMX7yIabtKfjx8DUQzPGteKkiM-mXnjR8Jfpbh983pkZMpwnftGs1G1HfS04wrS-6koDWu-K3yOf-bi3yCEaeEPm2kRGijxtwGItW5ND93cS92r-d0wPtrUz" />
                    <div>
                      <p className="font-bold text-on-surface group-hover:text-primary transition-colors">Cá Tầm Siberia</p>
                      <p className="text-xs text-slate-400">Loài: Acipenser baerii</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 font-mono text-sm text-slate-500">STG-SB-204</td>
                <td className="p-5 font-bold text-secondary">850,000 ₫</td>
                <td className="p-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-error">3 con</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-1/12 h-full bg-error rounded-full"></div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-primary-container/10 text-primary rounded-lg transition-all" title="Sửa">
                      <span className="material-symbols-outlined text-xl">edit_square</span>
                    </button>
                    <button className="p-2 hover:bg-error/10 text-error rounded-lg transition-all" title="Xóa">
                      <span className="material-symbols-outlined text-xl">delete_sweep</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
            <p className="text-sm font-medium text-slate-500">Trang <span className="text-primary font-bold">1</span> / 129</p>
            <div className="flex items-center gap-1">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-primary transition-all">
                <span className="material-symbols-outlined">first_page</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-primary transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-600 hover:text-primary transition-all font-semibold">2</button>
              <span className="px-2 text-slate-400">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-600 hover:text-primary transition-all font-semibold">129</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-primary transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-primary transition-all">
                <span className="material-symbols-outlined">last_page</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
